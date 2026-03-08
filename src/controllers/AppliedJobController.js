const AppliedJob = require("../models/AppliedJob");
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

exports.create = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
    } = req.body;

    const studentId = req.user.id;
    const { jobId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const file = req.file;

    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const s3Key = `resumes/${studentId}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const resumeUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const response = await AppliedJob.create({
      fullName,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
      resumeUrl,
      studentId,
      jobId,
    });

    return res.status(201).json({
      message: "Job applied successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while job applied",
      success: false,
      error: err.message,
    });
  }
};

exports.getAllJob = async (req, res) => {
  try {
    const response = await AppliedJob.find();
    res.status(200).json({
      message: "all jobs fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while getting the job", error: err.message });
  }
};

// exports.getJobById = async(req, res)=>{
//   try{
//    const {id} = req.body
//    const response = await
//   }
//   catch(err){
//     console.error(err)
//     res.status(500).json({message:"error while getting job by Id", error:err.message})
//   }
// }
