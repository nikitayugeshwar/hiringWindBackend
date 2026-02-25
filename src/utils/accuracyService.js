const { generate } = require("../config/gemini");

/**
 * Calculate accuracy using Gemini
 * @param {string} question
 * @param {string} correctAnswer
 * @param {string} userAnswer
 * @returns {number} accuracy (0-100)
 */
async function calculateAccuracy(question, correctAnswer, userAnswer) {
  try {
    const prompt = `
You are an interview evaluator.

Question:
${question}

Correct Answer:
${correctAnswer}

User Answer:
${userAnswer}

Evaluate how correct the user's answer is compared to the correct answer.
Return ONLY a number between 0 and 100.
Do NOT return text. Only return number.
`;

    const aiResponse = await generate(prompt);

    const accuracy = parseInt(aiResponse.match(/\d+/)?.[0]) || 0;

    return accuracy;
  } catch (error) {
    console.error("Accuracy calculation error:", error);
    return 0;
  }
}

module.exports = { calculateAccuracy };
