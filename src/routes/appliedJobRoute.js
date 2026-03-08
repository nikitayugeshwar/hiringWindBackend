const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { create, getAllJob } = require("../controllers/AppliedJobController");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/create/:jobId", authMiddleware, upload.single("resume"), create);
router.get("/getAllJob", getAllJob);

module.exports = router;
