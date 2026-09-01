const company = require("../models/company");
const job = require("../models/job");
const AppliedJob = require("../models/AppliedJob");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const buildTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASS,
    },
  });

exports.create = async (req, res) => {
  try {
    const {
      companyName,
      email,
      password,
      confirmPassword,
      companySize,
      industry,
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required", success: false });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "passwords do not match", success: false });
    }

    const alreadyExist = await company.findOne({ email });
    if (alreadyExist) {
      return res.status(400).json({
        message: "a company with this email already exists",
        success: false,
      });
    }

    const response = await company.create({
      companyName,
      email,
      password,
      companySize,
      industry,
    });

    res.status(201).json({
      message: "company created successfully",
      success: true,
      data: { _id: response._id, companyName, email },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while creating company", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await company.findOne({ email });

    if (!existUser) {
      return res
        .status(400)
        .json({ message: "invalid email or password", success: false });
    }

    // Accounts created before password hashing was introduced still hold a
    // plain-text password; verify it, then upgrade the record in place.
    const isHashed = existUser.password?.startsWith("$2");
    let isMatch;

    if (isHashed) {
      isMatch = await existUser.comparePassword(password);
    } else {
      isMatch = existUser.password === password;
      if (isMatch) {
        existUser.password = password;
        await existUser.save();
      }
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "invalid email or password", success: false });
    }

    const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("companyToken", token, cookieOptions);

    res.status(200).json({ message: "login successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while login", error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("companyToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ message: "Logged out successfully", success: true });
};

exports.getCompany = async (req, res) => {
  try {
    const { id } = req.company;
    const response = await company
      .findById(id)
      .select("-password -confirmPassword -otp");
    res.status(200).json({
      message: "company fetched successfully",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while getting company", error: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.company;
    const {
      companyName,
      companySize,
      industry,
      website,
      location,
      about,
      phone,
    } = req.body;

    const response = await company
      .findByIdAndUpdate(
        id,
        { companyName, companySize, industry, website, location, about, phone },
        { new: true, runValidators: true },
      )
      .select("-password -confirmPassword -otp");

    res.status(200).json({
      message: "profile updated successfully",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while updating company", error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { id } = req.company;

    const jobs = await job.find({ companyId: id }).lean();
    const jobIds = jobs.map((item) => item._id.toString());

    const applications = await AppliedJob.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .lean();

    const jobTitleById = {};
    jobs.forEach((item) => {
      jobTitleById[item._id.toString()] = item.jobTitle;
    });

    // Legacy rows were stored as "Applied" before the status enum existed.
    const normalise = (status) =>
      !status || status === "Applied" ? "pending" : status;

    const countByStatus = (status) =>
      applications.filter((item) => normalise(item.status) === status).length;

    const recentApplications = applications.slice(0, 5).map((item) => ({
      _id: item._id,
      fullName: item.fullName,
      email: item.email,
      status: normalise(item.status),
      jobId: item.jobId,
      jobTitle: jobTitleById[item.jobId] || "Unknown position",
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      message: "dashboard stats fetched successfully",
      success: true,
      data: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(
          (item) => !item.deadline || new Date(item.deadline) > new Date(),
        ).length,
        totalApplications: applications.length,
        interviewsScheduled: applications.filter(
          (item) => item.isInterviewScheduled,
        ).length,
        hired: countByStatus("hired"),
        shortlisted: countByStatus("shortlisted"),
        pending: countByStatus("pending"),
        rejected: countByStatus("rejected"),
        recentApplications,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "error while getting dashboard stats",
      error: error.message,
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existUser = await company.findOne({ email });

    if (!existUser) {
      return res
        .status(400)
        .json({ message: "no company found with this email", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existUser.otp = otp;
    await existUser.save();

    await buildTransport().sendMail({
      to: email,
      subject: "Your reset password otp is",
      html: `<h1>Your otp is ${otp}</h1>`,
    });

    res.status(200).json({ message: "otp send successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while send otp", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const existUser = await company.findOne({ email, otp });

    if (!existUser) {
      return res.status(400).json({ message: "invalid otp", success: false });
    }

    existUser.password = password;
    existUser.otp = undefined;
    await existUser.save();

    res
      .status(200)
      .json({ message: "password reset successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while reset password", error: error.message });
  }
};
