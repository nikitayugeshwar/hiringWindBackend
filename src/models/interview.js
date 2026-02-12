const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    default: "",
  },
  accuracy: {
    type: Number,
    default: 0,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    technology: {
      type: String,
    },
    experience: {
      type: String,
    },
    questionsNumber: {
      type: Number, // 🔥 should be Number not String
    },
    questions: [questionSchema], // ✅ ARRAY
  },
  { timestamps: true },
);

module.exports = mongoose.model("interview", interviewSchema);
