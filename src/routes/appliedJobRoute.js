const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  create,
  getAllJob,
  getJobById,
} = require("../controllers/AppliedJobController");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/create/:jobId", authMiddleware, upload.single("resume"), create);

router.get("/getJobById/:jobId", getJobById);

module.exports = router;
