const company = require("../models/company");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.create = async (req, res) => {
  try {
    const {
      companyName,
      email,
      password,
      confirmPassword,
      companySize,
      industry,
    } = req.body;
    const response = await company.create({
      companyName,
      email,
      password,
      confirmPassword,
      companySize,
      industry,
    });
    res.status(200).json({
      message: "company created successfullu",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error which creting company", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await company.findOne({ email, password });
    console.log("existUser", existUser);
    if (!existUser) {
      return res.status(400).json({ message: "user does not exist" });
    }

    const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("companyToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "login successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while login", error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email", email);
    const existUser = await company.findOne({ email });
    console.log("existUser", existUser);
    if (!existUser) {
      return res.status(400).json({ message: "user does not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existUser.otp = otp;
    await existUser.save();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nikitayugeshwar01@gmail.com",
        pass: "hffm dqxs kczw ylfg",
      },
    });

    await transport.sendMail({
      to: email,
      subject: "Your reset password otp is",
      html: `<h1>Your otp is ${otp}</h1>`,
    });
    res.status(200).json({ message: "otp send successfully", success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "error while send otp", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const existUser = await company.findOne({ email, otp });
    if (!existUser) {
      return res.status(400).json({ message: "invalid otp" });
    }
    existUser.password = password;
    existUser.otp = "";
    res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "error while reset password", error: error.message });
  }
};
