const express = require("express");
const {
  create,
  login,
  logout,
  getCompany,
  updateCompany,
  getDashboardStats,
  sendOtp,
  resetPassword,
} = require("../controllers/companyController");
const { companyMiddleware } = require("../middleware/comapanyMiddleware");
const router = express.Router();

router.post("/create", create);
router.post("/login", login);
router.post("/logout", logout);
router.post("/sendOtp", sendOtp);
router.post("/resetPassword", resetPassword);
router.get("/getCompany", companyMiddleware, getCompany);
router.put("/updateCompany", companyMiddleware, updateCompany);
router.get("/dashboardStats", companyMiddleware, getDashboardStats);
router.get("/companyAuthticated", companyMiddleware, (req, res) => {
  return res.status(200).json({ message: "authenticated", success: true });
});

module.exports = router;
