import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import { NextResponse } from "next/server";

// google gemini api
// Make sure to include these imports:

// Import the API key from the environment variables
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.API_KEY;
const client = new GoogleGenerativeAI( API_KEY );

// Create a generative model
const genModel = client.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    candidateCount: 1,
    stopSequences: ["x"],
    maxOutputTokens: 500,
    temperature: 1.0}
  });

// Start a chat with the model
const chat = genModel.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

// Define the handler function
const handler = async (req, res) => {
  try {
    const userInput = req.query.ques;
    const messages = [ {content: userInput} ];

    const result = await chat.sendMessage(userInput);

    // const responseContent = result[0].candidates[0]?.content;
    const responseContent = result.response.candidates[0].content.parts[0].text;
    // console.log(responseContent);
    messages.push({ content: responseContent });

    res.status(200).json({ resp: messages });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
  }
}

// Apply CORS middleware
const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
});

export default async function handlerWrapper(req, res) {
  console.log('req:', req);
  console.log('res:', res);

  corsMiddleware(req, res, async (err) => {
    if (err) {
      console.error("CORS error:", err);
      return res.status(500).json({ error: err.message });
    }
    await handler(req, res);
  });
  
}