const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  create,
  getJobById,
  getAppliedJob,
  updateStatus,
} = require("../controllers/AppliedJobController");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/create/:jobId", authMiddleware, upload.single("resume"), create);

router.get("/getJobById/:jobId", getJobById);
router.get("/getAppliedJob", authMiddleware, getAppliedJob);
router.put("/updateStatus/:id", authMiddleware, updateStatus);

module.exports = router;
