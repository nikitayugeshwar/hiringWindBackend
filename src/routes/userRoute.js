const express = require("express");
const {
  createUser,
  login,
  sendOtp,
  resetPassword,
} = require("../controllers/userController");
const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);

module.exports = router;
