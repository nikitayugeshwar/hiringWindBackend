const user = require("../models/user");
const nodemailer = require("nodemailer");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const response = await user.create({ name, email, password });
    res.status(201).json({
      message: "user created successfully",
      success: true,
      data: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "error while craeting the user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await user.findOne({ email, password });
    if (!existUser) {
      return res.status(400).json({ message: "Correct password daal BSDK" });
    }
    res.status(200).json({ message: "user login successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "error while login", error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const response = await user.find();
    res.status(200).json({
      message: "user fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "message while getting the user", error: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existUser = await user.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ message: "pahle account bna BSDK" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existUser.otp = otp;
    await existUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nikitayugeshwar01@gmail.com",
        pass: "hffm dqxs kczw ylfg",
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Your reset password otp is",
      html: `<h1>Your otp is ${otp}</h1>`,
    });
    res.status(200).json({ message: "otp send successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error whule sending otp", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const existUser = await user.findOne({ email, otp });
    if (!existUser) {
      return res.status(400).json({ message: "shi otp daal BSDK" });
    }
    existUser.password = password;
    existUser.otp = undefined;
    await existUser.save();
    res
      .status(200)
      .json({ message: "password reset successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "errro while reset password", error: err.message });
  }
};
