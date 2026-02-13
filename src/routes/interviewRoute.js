const express = require("express");
const { create, getQuestions } = require("../controllers/interviewController");
const router = express.Router();

router.post("/create", create);
router.get("/getQuestions/:id", getQuestions);

module.exports = router;
