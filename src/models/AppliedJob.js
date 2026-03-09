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
  },
  jobId: {
    type: String,
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("AppliedJob", AppliedJobSchema);
