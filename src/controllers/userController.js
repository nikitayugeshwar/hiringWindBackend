const user = require("../models/user");
const interview = require("../models/interview");
const AppliedJob = require("../models/AppliedJob");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required", success: false });
    }

    const alreadyExist = await user.findOne({ email });
    if (alreadyExist) {
      return res.status(400).json({
        message: "an account with this email already exists",
        success: false,
      });
    }

    const response = await user.create({ name, email, password });
    res.status(201).json({
      message: "user created successfully",
      success: true,
      data: { _id: response._id, name: response.name, email: response.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "error while creating the user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await user.findOne({ email });

    if (!existUser) {
      return res
        .status(400)
        .json({ message: "invalid email or password", success: false });
    }

    const isMatch = await existUser.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "invalid email or password", success: false });
    }

    const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, cookieOptions);
    res.status(200).json({ message: "user login successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "error while login", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.user;
    const response = await user.findById(id).select("-password -otp");
    res.status(200).json({
      message: "user fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while getting the user", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      name,
      mobile,
      location,
      headline,
      bio,
      skills,
      experience,
      education,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
    } = req.body;

    const response = await user
      .findByIdAndUpdate(
        id,
        {
          name,
          mobile,
          location,
          headline,
          bio,
          skills,
          experience,
          education,
          portfolioUrl,
          linkedinUrl,
          githubUrl,
        },
        { new: true, runValidators: true },
      )
      .select("-password -otp");

    res.status(200).json({
      message: "profile updated successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while updating the user", error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { id } = req.user;

    const interviews = await interview.find({ userId: id }).lean();
    const applications = await AppliedJob.find({ studentId: id })
      .populate("jobId")
      .lean();

    // An interview counts as attempted once at least one answer came back scored.
    const attempted = interviews.filter((item) =>
      (item.questions || []).some((q) => q.userAnswer),
    );

    const scoreOf = (item) => {
      const questions = item.questions || [];
      if (!questions.length) return 0;
      const total = questions.reduce((sum, q) => sum + (q.accuracy || 0), 0);
      return Math.round(total / questions.length);
    };

    const avgScore = attempted.length
      ? Math.round(
          attempted.reduce((sum, item) => sum + scoreOf(item), 0) /
            attempted.length,
        )
      : 0;

    // Per-technology roll-up powering the dashboard performance table.
    const byTechnology = {};
    attempted.forEach((item) => {
      const key = item.technology || "General";
      if (!byTechnology[key]) {
        byTechnology[key] = { technology: key, totalQ: 0, correct: 0, sum: 0 };
      }
      const questions = item.questions || [];
      byTechnology[key].totalQ += questions.length;
      byTechnology[key].correct += questions.filter(
        (q) => (q.accuracy || 0) >= 70,
      ).length;
      byTechnology[key].sum += scoreOf(item) * questions.length;
    });

    const performance = Object.values(byTechnology).map((row) => ({
      technology: row.technology,
      totalQ: row.totalQ,
      correct: row.correct,
      wrong: row.totalQ - row.correct,
      score: row.totalQ ? Math.round(row.sum / row.totalQ) : 0,
    }));

    // Most recent attempts first, for the trend chart.
    const trend = [...attempted]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-7)
      .map((item) => ({
        label: item.technology || "General",
        score: scoreOf(item),
        date: item.createdAt,
      }));

    const upcomingInterviews = applications
      .filter((item) => item.isInterviewScheduled && item.interviewDate)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .map((item) => ({
        _id: item._id,
        jobTitle: item.jobId?.jobTitle || "Interview",
        companyName: item.jobId?.companyName || "",
        interviewDate: item.interviewDate,
        interviewTime: item.interviewTime,
      }));

    res.status(200).json({
      message: "dashboard stats fetched successfully",
      success: true,
      data: {
        totalInterviews: interviews.length,
        attemptedInterviews: attempted.length,
        avgScore,
        jobsApplied: applications.length,
        shortlisted: applications.filter(
          (item) => item.status === "shortlisted" || item.status === "hired",
        ).length,
        performance,
        trend,
        upcomingInterviews,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting dashboard stats",
      error: err.message,
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existUser = await user.findOne({ email });
    if (!existUser) {
      return res
        .status(400)
        .json({ message: "no account found with this email", success: false });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existUser.otp = otp;
    await existUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Your reset password otp is",
      html: `<h1>Your otp is ${otp}</h1>`,
    });
    res.status(200).json({ message: "otp send successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while sending otp", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const existUser = await user.findOne({ email, otp });
    if (!existUser) {
      return res.status(400).json({ message: "invalid otp", success: false });
    }
    existUser.password = password;
    existUser.otp = undefined;
    await existUser.save();
    res
      .status(200)
      .json({ message: "password reset successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while reset password", error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // true in production (https)
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
