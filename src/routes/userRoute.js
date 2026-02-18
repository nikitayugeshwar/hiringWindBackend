const express = require("express");
const {
  createUser,
  login,
  sendOtp,
  resetPassword,
  getUserById,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);
router.get("/getUserById", authMiddleware, getUserById);

module.exports = router;
