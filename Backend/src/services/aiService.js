require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
console.log("My AI Key from .env:", API_KEY ? "Loaded" : "!!! NOT LOADED !!!");

if (!API_KEY) throw new Error("GEMINI_API_KEY is not set in the .env file.");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

(async () => {
  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error listing models:", err.response?.data || err.message);
  }
})();

const summarizeTicket = async (ticketSummary, ticketDescription) => {
  if (!ticketSummary) return ""; 

  try {
    const prompt = `
      You are an expert technical writer. Your job is to rewrite a technical ticket into one clear, human-readable sentence for release notes.
      Focus on what the user gets, not the technical jargon.

      RULES:
      - Be concise and friendly.
      - Start with a past-tense verb (e.g., "Fixed", "Added", "Improved").
      - If it's a bug, start with "Fixed".
      - If it's a feature, start with "Added" or "Introduced".
      - If it's an improvement, start with "Improved" or "Updated".

      Technical Summary: "${ticketSummary}"
      Technical Description: "${ticketDescription || 'No description'}"

      Write a single-sentence release note:
    `;

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await axios.post(API_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    return text.replace(/^["']|["']$/g, '');

  } catch (error) {
    console.error(`Error calling AI service: ${ticketSummary}`, error.response?.data || error.message);
    return ticketSummary; 
  }
};

module.exports = { summarizeTicket };
