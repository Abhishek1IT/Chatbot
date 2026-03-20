import express from "express";
import http from "http";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is missing in .env");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

console.log("Server starting...");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", async (msg) => {
    console.log("User:", msg);

    const text = String(msg || "").trim();

    if (!text) {
      socket.emit("reply", "Please type a message so I can respond.");
      return;
    }

    if (!model) {
      socket.emit("reply", "AI is not configured. Add GEMINI_API_KEY in backend/.env.");
      return;
    }

    try {
      const result = await model.generateContent([
        {
          text: "You are a helpful chatbot. Keep answers concise and clear.",
        },
        {
          text,
        },
      ]);

      const reply = result.response.text().trim() || "I could not generate a response.";
      socket.emit("reply", reply);
    } catch (error) {
      console.error("Gemini API Error:", error?.message || error);
      socket.emit("reply", "Sorry, I could not process that right now. Please try again.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
