import express from "express";
import { rateLimit, MemoryStore } from "express-rate-limit";
import { Configuration, OpenAIApi } from "openai";
import WebSocket from "ws";
import cors from "cors";

const store = new MemoryStore();

const PROMPTS_PER_DAY = 3;
const PORT = process.env.PORT || 6823;

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: PROMPTS_PER_DAY, // limit each user to 3 requests per windowMs
  message: "You have exceeded the 3 requests in 24 hours limit!", // message to send when a user has exceeded the limit
  keyGenerator: (req) => req.headers["fingerprint"] + "", // replace this with the fingerprint from fingerprint.js
  store,
  legacyHeaders: false,
  standardHeaders: true,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

console.log("WTF");

// Listen for WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");
  // Handle incoming messages from the client
  ws.on("message", async (message) => {
    try {
      // Parse the message from the client
      const data = JSON.parse(message.toString());

      // Call the OpenAI API and wait for the response
      const response = await openai.createCompletion(
        {
          model: "text-davinci-003",
          stream: true,
          prompt: data.prompt,
          max_tokens: 100,
          temperature: data.temperature,
          n: 1,
        },
        { responseType: "stream" }
      );

      const idDict = {};

      // Handle streaming data from the OpenAI API
      response.data.on("data", (data) => {
        console.log("\nDATA", data.toString());
        let lines = data?.toString()?.split("\n");
        lines = lines.filter((line) => line.trim() !== "");
        console.log("\nLINES", lines);
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            break; // Stream finished
          }
          try {
            const parsed = JSON.parse(message);
            console.log(parsed.choices[0].text);
            ws.send(parsed.choices[0].text);
          } catch (error) {
            console.error(
              "Could not JSON parse stream message",
              message,
              error
            );
          }
        }
      });

      // response.data.on('data', (chunk) => {
      //   // Extract the text from the chunk
      //   console.log("chunk", chunk);
      //   const result = JSON.parse(chunk.toString()).choices[0]?.text?.trim();
      //   console.log("result", result);
      //
      //   // Forward the result to the client via the WebSocket connection
      //   if (result) {
      //     ws.send(result);
      //   }
      // });

      // Handle the end of the stream
      response.data.on("end", () => {
        // Notify the client that the stream has ended
        ws.send("[DONE]");
      });
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error:", error);
      ws.send("An error occurred.");
    }
  });
});

// Upgrade HTTP connections to WebSocket connections
app.use("/ws", rateLimiter, (req, res, next) => {
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit("connection", ws, req);
  });
});

app.get("/api/completion", (req, res) => {
  const prompt = req.query.prompt as string;
  // OpenAI request
  // Respond with a JSON object that includes the received "prompt" value
  res.json({ receivedPrompt: prompt });
});

app.get("/api/prompts-remaining", (req, res) => {
  res.json({
    remaining: Math.max(
      PROMPTS_PER_DAY - (store.hits[req.headers["fingerprint"] + ""] ?? 0),
      0
    ),
  });
});

app.get("/api/hello", (req, res) => {
  console.log("ugh");
  res.json({ message: "Hello from the server!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
