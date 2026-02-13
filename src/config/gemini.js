// config/gemini.js
require("dotenv").config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables");
}

let ai;

async function initAI() {
  const { GoogleGenAI } = await import("@google/genai");
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

async function generate(prompt) {
  if (!ai) await initAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

module.exports = { generate };
