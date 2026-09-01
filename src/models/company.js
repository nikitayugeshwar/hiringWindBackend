const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const comapanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
    },
    companySize: {
      type: String,
    },
    industry: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    about: {
      type: String,
    },
    phone: {
      type: String,
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true },
);

comapanySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // confirmPassword is only used for signup validation, never stored
  this.confirmPassword = undefined;
});

comapanySchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("company", comapanySchema);
