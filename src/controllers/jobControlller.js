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
    console.log("req.body", req.body);

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
      .json({ message: "error while craeting job", error: err.message });
  }
};

exports.getJobComapnyId = async (req, res) => {
  try {
    const { id } = req.company;
    const response = await job.find({ companyId: id });
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
    const response = await job.findByIdAndDelete(id);
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

    const response = await job.findByIdAndUpdate(id, updatedData, {
      new: true,
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
      .json({ message: "error while uodateing the job", error: err.message });
  }
};
