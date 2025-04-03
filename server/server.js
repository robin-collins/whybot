"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const openai_1 = __importDefault(require("openai"));
const ws_1 = __importDefault(require("ws"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_admin_1 = require("firebase-admin");
const webpage_1 = __importDefault(require("./routes/webpage"));
(0, dotenv_1.config)();
// a function that takes a string, and integer for the number of start characters, and an integer for the number of end characters, and returns a string that only contains the start and end characters with "..." in between
const truncateString = (str, start, end) => {
    if (str.length <= start + end)
        return str;
    return str.slice(0, start) + "..." + str.slice(-end);
};
// log to console if the FIREBASE_PRIVATE_KEY and OPENAI_API_KEY and MAX_TOKENS environment variables are set using ✅ or ❌.
const logEnvVar = (envVar, name) => {
    if (envVar) {
        console.log(`${name} is set ✅`);
    }
    else {
        console.log(`${name} is not set ❌`);
    }
};
logEnvVar(process.env.FIREBASE_PRIVATE_KEY, "FIREBASE_PRIVATE_KEY");
logEnvVar(process.env.OPENAI_API_KEY, "OPENAI_API_KEY");
logEnvVar(process.env.MAX_TOKENS, "MAX_TOKENS");
// Check for GOOGLE_APPLICATION_CREDENTIALS which is needed for applicationDefault()
logEnvVar(process.env.GOOGLE_APPLICATION_CREDENTIALS, "GOOGLE_APPLICATION_CREDENTIALS");
(0, app_1.initializeApp)({
    // Use application default credentials.
    // This automatically looks for the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // pointing to your service account key file, or other standard credential sources.
    credential: firebase_admin_1.credential.applicationDefault(),
});
const MAX_TOKENS = parseInt((_a = process.env.MAX_TOKENS) !== null && _a !== void 0 ? _a : "4096");
const db = (0, firestore_1.getFirestore)();
const store = new express_rate_limit_1.MemoryStore();
const PROMPT_LIMITS = {
    "openai/gpt-4o-mini": 50,
    "openai/gpt-4o": 10,
};
const PORT = process.env.PORT || 6823;
function rateLimiterKey(model, fingerprint) {
    return model + "/" + fingerprint;
}
const rateLimiters = {
    "openai/gpt-4o-mini": (0, express_rate_limit_1.rateLimit)({
        windowMs: 24 * 60 * 60 * 1000,
        max: PROMPT_LIMITS["openai/gpt-4o-mini"],
        message: "You have exceeded the 5 requests in 24 hours limit!",
        keyGenerator: (req) => {
            return rateLimiterKey(req.query.model, req.query.fp);
        },
        store,
        legacyHeaders: false,
        standardHeaders: true,
    }),
    "openai/gpt-4o": (0, express_rate_limit_1.rateLimit)({
        windowMs: 24 * 60 * 60 * 1000,
        max: PROMPT_LIMITS["openai/gpt-4o"],
        message: "You have exceeded the 1 request per day limit!",
        keyGenerator: (req) => {
            return req.query.fp + "";
        },
        store: store,
        legacyHeaders: false,
        standardHeaders: true,
    }),
};
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Create a WebSocket server
const wss = new ws_1.default.Server({ noServer: true });
// Listen for WebSocket connections
wss.on("connection", (ws) => {
    // Handle incoming messages from the client
    ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var e_1, _a;
        var _b, _c;
        try {
            // Parse the message from the client
            const data = JSON.parse(message.toString());
            // Assuming data has a unique identifier like nodeId
            const nodeId = data.nodeId; // Adjust if the identifier has a different name
            try {
                const documentRef = yield db
                    .collection("completions")
                    .add(Object.assign(Object.assign({}, data), { createdAt: new Date() }));
                console.log("Document added with ID:", documentRef.id);
            }
            catch (error) {
                console.error("Error while adding document:", error);
            }
            // console.log("Sending the following data to the OpenAI API:", data);
            const oai_request_json = {
                model: data.model,
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant who always responds in English. Respond without any preamble, explanation, confirmation or commentary, just the final answer. Respond in markdown format if requested and make use of ## Headers, *italics*, **bold**, and lists as well as emoticons to make the answer more engaging. If requested to respond in JSON, only respond in JSON format, do not enclose it in ```json tags.",
                    },
                    { role: "user", content: data.prompt },
                ],
                max_tokens: MAX_TOKENS,
                temperature: data.temperature,
                n: 1,
            };
            // Call the OpenAI API and wait for the response
            const stream = yield openai.chat.completions.create(oai_request_json);
            let oai_response_json = "";
            try {
                // Process the stream using async iteration
                for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), !stream_1_1.done;) {
                    const part = stream_1_1.value;
                    const completion = (_c = (_b = part.choices[0]) === null || _b === void 0 ? void 0 : _b.delta) === null || _c === void 0 ? void 0 : _c.content;
                    if (completion != null) {
                        oai_response_json += completion;
                        // Send chunk with nodeId
                        ws.send(JSON.stringify({ type: 'chunk', nodeId, content: completion }));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) yield _a.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("OA Response Stream finished.");
            console.log("----------------------------------------------------------------");
            console.log(oai_response_json);
            console.log("----------------------------------------------------------------");
            // Send done signal with nodeId
            ws.send(JSON.stringify({ type: 'done', nodeId }));
        }
        catch (error) {
            // Handle any errors that occur during the API call
            console.error("Error during WebSocket message processing:", error);
            // Send error signal with nodeId
            const nodeId = (() => {
                try {
                    return JSON.parse(message.toString()).nodeId;
                }
                catch (_a) {
                    return null; // Or some default/error identifier
                }
            })();
            ws.send(JSON.stringify({ type: 'error', nodeId, message: (error === null || error === void 0 ? void 0 : error.message) || String(error) }));
            // Consider closing the connection on significant errors
            // ws.close();
        }
    }));
});
// Upgrade HTTP connections to WebSocket connections
app.use("/ws", (req, res, next) => {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        wss.emit("connection", ws, req);
    });
});
app.get("/api/completion", (req, res) => {
    const prompt = req.query.prompt;
    // OpenAI request
    // Respond with a JSON object that includes the received "prompt" value
    res.json({ receivedPrompt: prompt });
});
app.get("/api/prompts-remaining", (req, res) => {
    var _a, _b;
    const key = rateLimiterKey(req.query.model, req.query.fp);
    console.log("KEY", key);
    const remaining = Math.max(((_a = PROMPT_LIMITS[req.query.model]) !== null && _a !== void 0 ? _a : 5) -
        ((_b = store.hits[key]) !== null && _b !== void 0 ? _b : 0), 0);
    res.json({
        remaining: remaining,
    });
});
app.get("/api/moar-prompts", (req, res) => {
    var _a;
    const key = rateLimiterKey(req.query.model, req.query.fp);
    store.hits[key] = ((_a = store.hits[key]) !== null && _a !== void 0 ? _a : 0) - 3;
    console.log("Got moar prompts for", req.query.fp);
    res.json({
        message: "Decremented",
    });
});
app.get("/api/use-prompt", (req, res) => {
    const key = rateLimiterKey(req.query.model, req.query.fp);
    store.increment(key);
    res.json({
        message: `Used a token: ${key}`,
    });
});
app.get("/api/examples", (req, res) => {
    const examplesDir = path_1.default.join(__dirname, "examples");
    const exampleFiles = fs_1.default.readdirSync(examplesDir);
    const examples = exampleFiles.map((filename) => {
        const filePath = path_1.default.join(examplesDir, filename);
        const fileContent = fs_1.default.readFileSync(filePath, "utf8");
        return JSON.parse(fileContent);
    });
    res.json(examples);
});
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the server!" });
});
// Register the webpage fetching route
app.use('/api', webpage_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
