const mongoose = require("mongoose");

const comapanySchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("company", comapanySchema);
