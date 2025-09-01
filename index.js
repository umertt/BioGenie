require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/generate-bio", async (req, res) => {
  try {
    const { tone, length, keywords } = req.body;

    if (!tone || !length || !keywords) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const prompt = `Write a ${length.toLowerCase()} bio in a ${tone.toLowerCase()} tone using the keywords: ${keywords.join(", ")}.    ${length.toLowerCase() === "short" ? " Keep it under 150 characters." : ""}`;


    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that writes professional bios." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const bio = response.data.choices[0].message.content.trim();
    res.json({ bio });

  } catch (error) {
    console.error("OpenRouter error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate bio." });
  }
});

app.listen(port, () => {
  console.log(`✅ Free server running at http://localhost:${port}`);
});
