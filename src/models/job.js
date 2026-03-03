const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
  },
  companyName: {
    type: String,
  },
  location: {
    type: String,
  },
  jobType: {
    type: String,
  },
  salary: {
    type: String,
  },
  experience: {
    type: String,
  },
  description: {
    type: String,
  },
  skills: {
    type: String,
  },
  deadline: {
    type: String,
  },
  companyId: {
    type: String,
  },
});

module.exports = mongoose.model("job", jobSchema);
