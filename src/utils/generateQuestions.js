const { model } = require("../config/gemini");

exports.generateQuestions = async (technology, experience, questionsNumber) => {
  const prompt = `
Generate ${questionsNumber} interview questions.

Technology: ${technology}
Experience: ${experience} years

Return ONLY valid JSON in this format:

{
 "questions":[
   {
     "question":"...",
     "correctAnswer":"..."
   }
 ]
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace(/```json|```/g, "");
  const parsed = JSON.parse(text);

  return parsed.questions;
};
