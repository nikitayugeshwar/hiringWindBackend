const express = require("express");
const {
  create,
  getQuestions,
  getCount,
  endInterview,
} = require("../controllers/interviewController");
const router = express.Router();

router.post("/create", create);
router.get("/getQuestions/:id", getQuestions);
router.get("/getCount", getCount);
router.post("/endInterview/:id", endInterview);

module.exports = router;
