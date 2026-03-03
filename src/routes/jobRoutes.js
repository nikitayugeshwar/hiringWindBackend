const express = require("express");
const {
  create,
  getJobComapnyId,
  deleteJob,
  updateJob,
} = require("../controllers/jobControlller");
const { companyMiddleware } = require("../middleware/comapanyMiddleware");
const router = express.Router();

router.post("/create", companyMiddleware, create);
router.get("/getJobComapnyId", companyMiddleware, getJobComapnyId);
router.put("/updateJob/:id", companyMiddleware, updateJob);
// router.get("/getSingleJob/:id", companyMiddleware, getSingleJob);
router.delete("/deleteJob", deleteJob);

module.exports = router;
