const express = require("express");
const {
  create,
  getQuestions,
  getCount,
  endInterview,
  getInterviewListByUserId,
} = require("../controllers/interviewController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", create);
router.get("/getQuestions/:id", getQuestions);
router.get("/getCount", getCount);
router.post("/endInterview/:id", endInterview);
router.get(
  "/getInterviewListByUserId",
  authMiddleware,
  getInterviewListByUserId,
);

module.exports = router;
