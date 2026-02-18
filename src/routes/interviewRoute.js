const express = require("express");
const {
  create,
  getQuestions,
  getCount,
} = require("../controllers/interviewController");
const router = express.Router();

router.post("/create", create);
router.get("/getQuestions/:id", getQuestions);
router.get("/getCount", getCount);

module.exports = router;
