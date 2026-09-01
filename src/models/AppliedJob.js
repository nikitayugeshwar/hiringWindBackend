const mongoose = require("mongoose");

const AppliedJobSchema = new mongoose.Schema(
  {
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
    interviewTime: {
      type: String,
    },
    interviewDate: {
      type: Date,
    },
    isInterviewScheduled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Legacy documents were created with status "Applied"; normalise them so they
// still validate against the enum whenever the doc is saved again.
AppliedJobSchema.pre("save", function () {
  if (this.status === "Applied") {
    this.status = "pending";
  }
});

module.exports = mongoose.model("AppliedJob", AppliedJobSchema);
