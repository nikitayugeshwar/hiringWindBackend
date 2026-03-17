const mongoose = require("mongoose");

const AppliedJobSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  currentSalary: {
    type: Number,
  },
  expectedSalary: {
    type: Number,
  },
  noticePeriod: {
    type: Number,
  },
  resumeUrl: {
    type: String,
  },
  studentId: {
    type: String,
    ref: "student",
  },
  jobId: {
    type: String,
    ref: "job",
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("AppliedJob", AppliedJobSchema);
