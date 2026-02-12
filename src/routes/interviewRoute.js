const express = require("express");
const { create } = require("../controllers/interviewController");
const router = express.Router();

router.post("/create", create);

module.exports = router;
