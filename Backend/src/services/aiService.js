require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("GEMINI_API_KEY missing.");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

function extractJiraText(desc) {
  if (!desc) return "";

  if (typeof desc === "string") return desc;

  if (typeof desc === "object") {
    try {
      return JSON.stringify(desc)
        .replace(/<[^>]*>/g, "")
        .replace(/\\"/g, '"')
        .replace(/\s+/g, " ")
        .substring(0, 600);
    } catch {
      return "";
    }
  }

  return "";
}

const batchSummarizeTickets = async (tickets) => {
  if (!tickets || tickets.length === 0) return [];

  try {
    let ticketTextBlock = "";

    tickets.forEach((t, index) => {
      const summary = t.fields.summary || "";
      const desc = extractJiraText(t.fields.description);

      ticketTextBlock += `#${index + 1}: ${summary} — ${desc}\n`;
    });

    const prompt = `
      Rewrite ALL the Jira tickets below into one-sentence, human-friendly release notes.

      Rules:
      - ONE sentence per ticket.
      - Start sentences with a past-tense verb.
      - Bug → "Fixed ..."
      - Feature → "Added ..." / "Introduced ..."
      - Improvement → "Improved ..."
      - NO jira keys, no internal tech jargon.
      - Output MUST be a bullet list (one bullet per ticket).

      TICKETS:
      ${ticketTextBlock}

      Return ONLY bullet points like:
      - Fixed XYZ...
      - Added ABC...
      - Improved DEF...
    `;

    const res = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" }, timeout: 45000 }
    );

    const text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const lines = text
      .split("\n")
      .map((l) => l.replace(/^[-•\s]+/, "").trim())
      .filter((l) => l.length > 0);

    return lines;
  } catch (err) {
    console.error("❌ Batch AI failed:", err.response?.data || err);
    throw new Error("Batch AI summarization failed");
  }
};

module.exports = { batchSummarizeTickets };
