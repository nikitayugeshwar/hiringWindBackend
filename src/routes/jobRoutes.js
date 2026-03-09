const express = require("express");
const {
  create,
  getJobComapnyId,
  deleteJob,
  updateJob,
  fetchedJobById,
  getAllJob,
} = require("../controllers/jobControlller");
const { companyMiddleware } = require("../middleware/comapanyMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", companyMiddleware, create);
router.get("/getJobComapnyId", companyMiddleware, getJobComapnyId);
router.put("/updateJob/:id", companyMiddleware, updateJob);
router.get("/fetchedJobById/:id", fetchedJobById);
router.delete("/deleteJob/:id", deleteJob);
router.get("/getAllJob", authMiddleware, getAllJob);

module.exports = router;
