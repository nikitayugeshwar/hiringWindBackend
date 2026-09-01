const AppliedJob = require("../models/AppliedJob");
const job = require("../models/job");
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const nodemailer = require("nodemailer");

const buildTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASS,
    },
  });

// Legacy rows were stored as "Applied" before the status enum existed.
const normaliseStatus = (status) =>
  !status || status === "Applied" ? "pending" : status;

exports.create = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
    } = req.body;

    const studentId = req.user.id;
    const { jobId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const alreadyApplied = await AppliedJob.findOne({ studentId, jobId });
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    const file = req.file;

    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const s3Key = `resumes/${studentId}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const resumeUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const response = await AppliedJob.create({
      fullName,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
      resumeUrl,
      studentId,
      jobId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Job applied successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while job applied",
      success: false,
      error: err.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { id } = req.company;

    // Only the company that owns the posting may read its applicants.
    const jobDoc = await job.findById(jobId);
    if (!jobDoc || jobDoc.companyId !== id) {
      return res.status(403).json({
        message: "you do not have access to this job",
        success: false,
      });
    }

    const response = await AppliedJob.find({ jobId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "data found successfully",
      success: true,
      data: response.map((item) => ({
        ...item.toObject(),
        status: normaliseStatus(item.status),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting the job by id",
      error: err.message,
    });
  }
};

exports.getApplicationCountByJob = async (req, res) => {
  try {
    const { id } = req.company;

    const jobs = await job.find({ companyId: id }).select("_id").lean();
    const jobIds = jobs.map((item) => item._id.toString());

    const applications = await AppliedJob.find({ jobId: { $in: jobIds } })
      .select("jobId status")
      .lean();

    const counts = {};
    jobIds.forEach((jobId) => {
      counts[jobId] = { total: 0, shortlisted: 0 };
    });

    applications.forEach((item) => {
      if (!counts[item.jobId]) return;
      counts[item.jobId].total += 1;
      if (normaliseStatus(item.status) === "shortlisted") {
        counts[item.jobId].shortlisted += 1;
      }
    });

    res.status(200).json({
      message: "application counts fetched successfully",
      success: true,
      data: counts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting application counts",
      error: err.message,
    });
  }
};

exports.getScheduledInterviews = async (req, res) => {
  try {
    const { id } = req.company;

    const jobs = await job.find({ companyId: id }).lean();
    const jobById = {};
    jobs.forEach((item) => {
      jobById[item._id.toString()] = item;
    });

    const applications = await AppliedJob.find({
      jobId: { $in: Object.keys(jobById) },
      isInterviewScheduled: true,
    })
      .sort({ interviewDate: 1 })
      .lean();

    res.status(200).json({
      message: "scheduled interviews fetched successfully",
      success: true,
      data: applications.map((item) => ({
        _id: item._id,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        resumeUrl: item.resumeUrl,
        status: normaliseStatus(item.status),
        interviewDate: item.interviewDate,
        interviewTime: item.interviewTime,
        jobId: item.jobId,
        jobTitle: jobById[item.jobId]?.jobTitle || "Unknown position",
        location: jobById[item.jobId]?.location || "",
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting scheduled interviews",
      error: err.message,
    });
  }
};

exports.getAppliedJob = async (req, res) => {
  try {
    const studentId = req.user.id;

    const response = await AppliedJob.find({ studentId })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Applied jobs fetched successfully",
      data: response.map((item) => ({
        ...item.toObject(),
        status: normaliseStatus(item.status),
      })),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Error while fetching applied job",
      error: err.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const application = await AppliedJob.findById(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Only the company that owns the posting may move an application along.
    const jobDoc = await job.findById(application.jobId);
    if (!jobDoc || jobDoc.companyId !== req.company.id) {
      return res.status(403).json({
        success: false,
        message: "you do not have access to this application",
      });
    }

    application.status = status;
    await application.save();

    const io = req.app.get("io");

    // Notify the applicant, not the company making the change.
    io.to(application.studentId).emit("jobStatus", {
      message: `Your application for ${jobDoc.jobTitle} is now ${status}`,
      status,
      jobTitle: jobDoc.jobTitle,
      applicationId: application._id,
    });

    if (application.email) {
      await buildTransport().sendMail({
        to: application.email,
        subject: "Status Updated",
        html: `<h1>Your application for ${jobDoc.jobTitle} is now ${status}</h1>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: application,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: err.message,
    });
  }
};

exports.scheduleInterview = async (req, res) => {
  try {
    const { interviewTime, interviewDate, jobId } = req.body;
    const { studentId } = req.params;

    const jobDoc = await job.findById(jobId);
    if (!jobDoc || jobDoc.companyId !== req.company.id) {
      return res.status(403).json({
        success: false,
        message: "you do not have access to this job",
      });
    }

    const response = await AppliedJob.findOne({ studentId, jobId });
    if (!response) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    response.interviewTime = interviewTime;
    response.interviewDate = interviewDate;
    response.isInterviewScheduled = true;
    await response.save();

    const io = req.app.get("io");
    const readableDate = new Date(interviewDate).toLocaleDateString();

    io.to(studentId).emit("jobStatus", {
      message: `Interview scheduled for ${jobDoc.jobTitle} on ${readableDate} at ${interviewTime}`,
      status: response.status,
      jobTitle: jobDoc.jobTitle,
      applicationId: response._id,
    });

    if (response.email) {
      await buildTransport().sendMail({
        to: response.email,
        subject: "Interview Scheduled",
        html: `<h1>Your interview for ${jobDoc.jobTitle} is scheduled on ${readableDate} at ${interviewTime}</h1>`,
      });
    }

    return res
      .status(200)
      .json({ message: "interview scheduled successfully", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
