const express = require("express");
const {
  create,
  login,
  sendOtp,
  resetPassword,
} = require("../controllers/companyController");
const { companyMiddleware } = require("../middleware/comapanyMiddleware");
const router = express.Router();

router.post("/create", create);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);
router.get("/companyAuthticated", companyMiddleware, (req, res) => {
  return res.status(200).json({ message: "authenticated", success: true });
});

module.exports = router;
