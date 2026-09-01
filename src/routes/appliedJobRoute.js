const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { companyMiddleware } = require("../middleware/comapanyMiddleware");
const {
  create,
  getJobById,
  getAppliedJob,
  updateStatus,
  scheduleInterview,
  getApplicationCountByJob,
  getScheduledInterviews,
} = require("../controllers/AppliedJobController");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/create/:jobId", authMiddleware, upload.single("resume"), create);

// Company-facing: these are called from the company panel, so they must
// authenticate against companyToken rather than the student token.
router.get("/getJobById/:jobId", companyMiddleware, getJobById);
router.get("/applicationCounts", companyMiddleware, getApplicationCountByJob);
router.get("/scheduledInterviews", companyMiddleware, getScheduledInterviews);
router.put("/updateStatus/:id", companyMiddleware, updateStatus);
router.post("/scheduleInterview/:studentId", companyMiddleware, scheduleInterview);

// Student-facing
router.get("/getAppliedJob", authMiddleware, getAppliedJob);

module.exports = router;
