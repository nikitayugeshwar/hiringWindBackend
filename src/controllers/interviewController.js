const interview = require("../models/interview");
const { generateQuestions } = require("../utils/generateQuestions.js");

exports.create = async (req, res) => {
  try {
    const { technology, experience, questionsNumber } = req.body;

    // 🔥 generate AI questions
    const questions = await generateQuestions(
      technology,
      experience,
      questionsNumber,
    );
    console.log("questions", questions);

    const response = await interview.create({
      technology,
      experience,
      questionsNumber,
      questions, // save in DB
    });

    res.status(200).json({
      message: "Interview created successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error while creating the interview",
      error: err.message,
    });
  }
};
