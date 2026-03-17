const express = require("express");
const {
  createUser,
  login,
  sendOtp,
  resetPassword,
  getUserById,
  logout,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);
router.get("/getUserById", authMiddleware, getUserById);
router.get("/isAuthenticated", authMiddleware, (req, res) => {
  const studentId = req.user.id;
  return res
    .status(200)
    .json({ message: "authenticated", success: true, data: studentId });
});
router.post("/logout", logout);

module.exports = router;
