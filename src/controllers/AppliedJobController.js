const AppliedJob = require("../models/AppliedJob");

exports.create = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
      resumeUrl,
    } = req.body;
    const studentId = req.user.id;
    const { jobId } = req.params;
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
    });
    res.status(201).json({
      message: "job applied successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while job applied", error: err.message });
  }
};
