const interview = require("../models/interview");
const { generateQuestions } = require("../utils/generateQuestions.js");
const { calculateAccuracy } = require("../utils/accuracyService.js");

// An interview is "Completed" once every question carries an answer.
const summarise = (item) => {
  const questions = item.questions || [];
  const answered = questions.filter((q) => q.userAnswer).length;
  const score = questions.length
    ? Math.round(
        questions.reduce((sum, q) => sum + (q.accuracy || 0), 0) /
          questions.length,
      )
    : 0;

  return {
    answered,
    score,
    status:
      answered === 0
        ? "Not started"
        : answered === questions.length
          ? "Completed"
          : "In Progress",
  };
};

exports.create = async (req, res) => {
  try {
    const { technology, experience, questionsNumber } = req.body;
    const userId = req.user.id;

    if (!technology || !experience || !questionsNumber) {
      return res.status(400).json({
        message: "technology, experience and questionsNumber are required",
        success: false,
      });
    }

    // 🔥 generate AI questions
    const questions = await generateQuestions(
      technology,
      experience,
      questionsNumber,
    );

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

    if (!response) {
      return res
        .status(404)
        .json({ message: "interview not found", success: false });
    }
    if (response.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "this interview is not yours", success: false });
    }

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
    res.status(200).json({
      message: "interview count successfully",
      success: true,
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

    if (response.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "this interview is not yours", success: false });
    }

    for (const q of response.questions) {
      const matchQuestion = (questionData || []).find(
        (item) => item.question === q.question,
      );

      if (matchQuestion && matchQuestion.userAnswer) {
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
    const response = await interview
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "interview list fetched successfully",
      success: true,
      data: response.map((item) => ({ ...item, ...summarise(item) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "error while getting interview list by id",
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
