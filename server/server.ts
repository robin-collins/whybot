import express from "express";
import { rateLimit, MemoryStore } from "express-rate-limit";
import OpenAI from "openai";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";
import WebSocket from "ws";
import cors from "cors";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

import webpageRoutes from './routes/webpage';

config();

// a function that takes a string, and integer for the number of start characters, and an integer for the number of end characters, and returns a string that only contains the start and end characters with "..." in between
const truncateString = (str: string, start: number, end: number) => {
  if (str.length <= start + end) return str;
  return str.slice(0, start) + "..." + str.slice(-end);
};

// log to console if the FIREBASE_PRIVATE_KEY and OPENAI_API_KEY and MAX_TOKENS environment variables are set using ✅ or ❌.
const logEnvVar = (envVar: string | undefined, name: string) => {
  if (envVar) {
    console.log(`${name} is set ✅`);
  } else {
    console.log(`${name} is not set ❌`);
  }
};

// logEnvVar(process.env.FIREBASE_PRIVATE_KEY, "FIREBASE_PRIVATE_KEY");
// logEnvVar(process.env.OPENAI_API_KEY, "OPENAI_API_KEY");
// logEnvVar(process.env.MAX_TOKENS, "MAX_TOKENS");

// Check for GOOGLE_APPLICATION_CREDENTIALS which is needed for applicationDefault()
// logEnvVar(process.env.GOOGLE_APPLICATION_CREDENTIALS, "GOOGLE_APPLICATION_CREDENTIALS");

initializeApp({
  // Use application default credentials.
  // This automatically looks for the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // pointing to your service account key file, or other standard credential sources.
  credential: credential.applicationDefault(),
});

const MAX_TOKENS = parseInt(process.env.MAX_TOKENS ?? "4096");

const db = getFirestore();

const store = new MemoryStore();

const PROMPT_LIMITS = {
  "openai/gpt-4.1-mini": 5000,
  "openai/gpt-4.1": 1000,
};
const PORT = process.env.PORT || 6823;

function rateLimiterKey(model: string, fingerprint: string) {
  return model + "/" + fingerprint;
}

const rateLimiters = {
  "openai/gpt-4.1-mini": rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    max: PROMPT_LIMITS["openai/gpt-4.1-mini"],
    message: "You have exceeded the 5 requests in 24 hours limit!", // message to send when a user has exceeded the limit
    keyGenerator: (req) => {
      return rateLimiterKey(req.query.model as string, req.query.fp as string);
    },
    store,
    legacyHeaders: false,
    standardHeaders: true,
  }),
  "openai/gpt-4.1": rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    max: PROMPT_LIMITS["openai/gpt-4.1"],
    message: "You have exceeded the 1 request per day limit!", // message to send when a user has exceeded the limit
    keyGenerator: (req) => {
      return req.query.fp + "";
    },
    store: store,
    legacyHeaders: false,
    standardHeaders: true,
  }),
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Listen for WebSocket connections
wss.on("connection", (ws) => {
  // Handle incoming messages from the client
  ws.on("message", async (message) => {
    try {
      // Parse the message from the client
      const data = JSON.parse(message.toString());

      // Assuming data has a unique identifier like nodeId
      const nodeId = data.nodeId; // Adjust if the identifier has a different name

      try {
        const documentRef = await db
          .collection("completions")
          .add({ ...data, createdAt: new Date() });
        // console.log("Document added:", documentRef.id);
      } catch (error) {
        console.error("Error while adding document:", error);
      }

      // console.log("Sending the following data to the OpenAI API:", data);



      const oai_request_json: ChatCompletionCreateParamsStreaming = {
        model: data.model,
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant who always responds in English. Respond without any preamble, explanation, confirmation or commentary, just the final answer. Respond in markdown format if requested and make use of ## Headers, *italics*, **bold**, and lists as well as emoticons to make the answer more engaging. If requested to respond in JSON, only respond in JSON format, do not enclose it in ```json tags.",
          },
          { role: "user", content: data.prompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: data.temperature,
        n: 1,
      };

      // Call the OpenAI API and wait for the response
      const stream = await openai.chat.completions.create(oai_request_json);

      let oai_response_json = "";

      // Process the stream using async iteration
      for await (const part of stream) {
        const completion = part.choices[0]?.delta?.content;
        if (completion != null) {
          oai_response_json += completion;
          // Send chunk with nodeId
          ws.send(JSON.stringify({ type: 'chunk', nodeId, content: completion }));
        }
      }
      // console.log("OA Response Stream finished.");
      // console.log("----------------------------------------------------------------");
      // console.log(oai_response_json);
      //console.log("----------------------------------------------------------------");
      // Send done signal with nodeId
      ws.send(JSON.stringify({ type: 'done', nodeId }));

    } catch (error: any) {
      // Handle any errors that occur during the API call
      console.error("Error during WebSocket message processing:", error);
      // Send error signal with nodeId
      const nodeId = (() => {
        try {
          return JSON.parse(message.toString()).nodeId;
        } catch {
          return null; // Or some default/error identifier
        }
      })();
      ws.send(JSON.stringify({ type: 'error', nodeId, message: error?.message || String(error) }));
      // Consider closing the connection on significant errors
      // ws.close();
    }
  });
});

// Upgrade HTTP connections to WebSocket connections
app.use("/ws", (req, res, next) => {
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
  const key = rateLimiterKey(req.query.model as string, req.query.fp as string);
  // console.log("KEY", key);

  const remaining = Math.max(
    (PROMPT_LIMITS[req.query.model as keyof typeof PROMPT_LIMITS] ?? 5) -
      (store.hits[key] ?? 0),
    0
  );

  res.json({
    remaining: remaining,
  });
});

app.get("/api/moar-prompts", (req, res) => {
  const key = rateLimiterKey(req.query.model as string, req.query.fp as string);
  store.hits[key] = (store.hits[key] ?? 0) - 3;
  // console.log("Got moar prompts for", req.query.fp);
  res.json({
    message: "Decremented",
  });
});

app.get("/api/use-prompt", (req, res) => {
  const key = rateLimiterKey(req.query.model as string, req.query.fp as string);
  store.increment(key);
  res.json({
    message: `Used a token: ${key}`,
  });
});

app.get("/api/examples", (req, res) => {
  const examplesDir = path.join(__dirname, "examples");
  const exampleFiles = fs.readdirSync(examplesDir);
  const examples = exampleFiles.map((filename) => {
    const filePath = path.join(examplesDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  });
  res.json(examples);
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Register the webpage fetching route
app.use('/api', webpageRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
