const AppliedJob = require("../models/AppliedJob");
const job = require("../models/job");

exports.create = async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      location,
      jobType,
      salary,
      experience,
      description,
      skills,
      deadline,
    } = req.body;
    const { id } = req.company;

    const response = await job.create({
      jobTitle,
      companyName,
      location,
      jobType,
      salary,
      experience,
      description,
      skills,
      deadline,
      companyId: id,
    });
    res.status(201).json({
      message: "job created successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while creating job", error: err.message });
  }
};

exports.getJobComapnyId = async (req, res) => {
  try {
    const { id } = req.company;
    const response = await job.find({ companyId: id }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "job fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while fetching job by id", error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await job.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "job not found", success: false });
    }
    if (existing.companyId !== req.company.id) {
      return res
        .status(403)
        .json({ message: "you do not own this job", success: false });
    }

    await job.findByIdAndDelete(id);
    // Applications pointing at a removed posting would otherwise be orphaned.
    await AppliedJob.deleteMany({ jobId: id });

    res
      .status(200)
      .json({ message: "job deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while deleting job", error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const existing = await job.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "job not found", success: false });
    }
    if (existing.companyId !== req.company.id) {
      return res
        .status(403)
        .json({ message: "you do not own this job", success: false });
    }

    // companyId is derived from the session, never from the request body.
    delete updatedData.companyId;

    const response = await job.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      message: "update job successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while updating the job", error: err.message });
  }
};

exports.fetchedJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await job.findById(id);
    res.status(200).json({
      message: "job by id fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ message: "error while fetching job by id", error: err.message });
  }
};

exports.getAllJob = async (req, res) => {
  try {
    const studentId = req.user.id;
    const jobData = await job.find().sort({ createdAt: -1 }).lean();

    const applied = await AppliedJob.find({ studentId })
      .select("jobId status")
      .lean();

    const appliedByJobId = {};
    applied.forEach((item) => {
      appliedByJobId[item.jobId] = item.status;
    });

    // Applicant counts let the listing show real interest per posting.
    const counts = await AppliedJob.aggregate([
      { $group: { _id: "$jobId", total: { $sum: 1 } } },
    ]);
    const countByJobId = {};
    counts.forEach((item) => {
      countByJobId[item._id] = item.total;
    });

    const updatedJobs = jobData.map((item) => {
      const jobId = item._id.toString();
      return {
        ...item,
        applicants: countByJobId[jobId] || 0,
        hasApplied: Boolean(appliedByJobId[jobId]),
        status: appliedByJobId[jobId] || "Apply now",
      };
    });

    res.status(200).json({
      message: "all jobs fetched successfully",
      success: true,
      data: updatedJobs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while fetching all jobs",
      error: err.message,
    });
  }
};

exports.searchJob = async (req, res) => {
  try {
    const { searchType } = req.body;
    const response = await job
      .find({
        $or: [
          { jobTitle: { $regex: searchType, $options: "i" } },
          { companyName: { $regex: searchType, $options: "i" } },
          { location: { $regex: searchType, $options: "i" } },
          { skills: { $regex: searchType, $options: "i" } },
        ],
      })
      .limit(10);
    res.status(200).json({
      message: "job found successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error in job search", error: err.message });
  }
};
