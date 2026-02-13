const { generate } = require("../config/gemini");

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

  // generate() now returns text directly
  const text = (await generate(prompt)).replace(/```json|```/g, "");
  const parsed = JSON.parse(text);

  return parsed.questions;
};
