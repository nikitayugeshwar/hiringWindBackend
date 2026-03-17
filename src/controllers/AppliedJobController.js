const AppliedJob = require("../models/AppliedJob");
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const nodemailer = require("nodemailer");

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
      status: "Applied",
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
    const response = await AppliedJob.find({ jobId });
    res.status(200).json({
      message: "data found successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting the job by id",
      error: err.message,
    });
  }
};

exports.getAppliedJob = async (req, res) => {
  try {
    const studentId = req.user.id;

    const response = await AppliedJob.find({ studentId }).populate("jobId");

    res.status(200).json({
      success: true,
      message: "Applied jobs fetched successfully",
      data: response,
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
    const studentId = req.user.id;

    const updatedApplication = await AppliedJob.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    const io = req.app.get("io");

    io.to(studentId).emit("jobStatus", {
      message: `your job status has been changed to ${status}`,
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
      },
    });

    await transport.sendMail({
      to: updatedApplication.email,
      subject: "Status Updated",
      html: `<h1>Your job status has been changed .. Your resume got ${status}</h1>`,
    });

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedApplication,
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
