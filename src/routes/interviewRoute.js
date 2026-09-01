const express = require("express");
const {
  create,
  getQuestions,
  getCount,
  endInterview,
  getInterviewListByUserId,
  getInterview,
} = require("../controllers/interviewController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", authMiddleware, create);
router.get("/getQuestions/:id", authMiddleware, getQuestions);
router.get("/getCount", getCount);
router.post("/endInterview/:id", authMiddleware, endInterview);
router.get(
  "/getInterviewListByUserId",
  authMiddleware,
  getInterviewListByUserId,
);
router.get("/getInterview", getInterview);

module.exports = router;
