const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    mobile: {
      type: Number,
    },
    location: {
      type: String,
    },
    headline: {
      type: String,
    },
    bio: {
      type: String,
    },
    skills: {
      type: String,
    },
    experience: {
      type: String,
    },
    education: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
