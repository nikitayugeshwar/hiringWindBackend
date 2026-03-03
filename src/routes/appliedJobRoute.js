const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { create } = require("../controllers/AppliedJobController");
const router = express.Router();

router.post("/create/:jobId", authMiddleware, create);

module.exports = router;
