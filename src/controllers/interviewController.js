const interview = require("../models/interview");
const { generateQuestions } = require("../utils/generateQuestions.js");
const { calculateAccuracy } = require("../utils/accuracyService.js");

exports.create = async (req, res) => {
  try {
    const { technology, experience, questionsNumber, userId } = req.body;
    console.log("req.body.userId", req.body.userId);

    // 🔥 generate AI questions
    const questions = await generateQuestions(
      technology,
      experience,
      questionsNumber,
    );
    console.log("questions", questions);

    const response = await interview.create({
      userId,
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

exports.getQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await interview.findById(id);
    res.status(200).json({
      message: "questions fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting the questions",
      error: err.message,
    });
  }
};

exports.getCount = async (req, res) => {
  try {
    const response = await interview.countDocuments();
    console.log("response", response);
    res.status(200).json({
      message: "interview count successfully",
      success: "true",
      data: response,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "error while count the interview", error: err.message });
  }
};

exports.endInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionData } = req.body;

    const response = await interview.findById(id);

    if (!response) {
      return res.status(404).json({
        message: "Interview not found",
        success: false,
      });
    }

    for (const q of response.questions) {
      const matchQuestion = questionData.find(
        (item) => item.question === q.question,
      );

      if (matchQuestion) {
        q.userAnswer = matchQuestion.userAnswer;

        // 🔥 Call service here
        q.accuracy = await calculateAccuracy(
          q.question,
          q.correctAnswer,
          q.userAnswer,
        );
      }
    }

    await response.save();

    res.status(200).json({
      message: "Interview ended successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

exports.getInterviewListByUserId = async (req, res) => {
  try {
    const { id } = req.user;
    const response = await interview.find({ userId: id });
    res.status(200).json({
      message: "interview list fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "errro while getting unterview list by id",
      error: err.message,
    });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const response = await interview.find();
    res.status(200).json({
      message: "interview fetched successfully",
      success: true,
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while getting the interview",
      error: err.message,
    });
  }
};
