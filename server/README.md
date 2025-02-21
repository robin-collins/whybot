I'll provide a comprehensive overview of the server.ts file:

### Server Configuration
- Built using Express.js with WebSocket support
- Runs on port 6823 by default (configurable via PORT environment variable)
- Uses CORS for cross-origin requests
- Integrates with OpenAI and Firebase services

### Environment Variables Required
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `OPENAI_API_KEY`: OpenAI API authentication key

### Rate Limiting
Two different rate limit tiers are implemented:
1. "openai/gpt3.5":
   - 50 requests per 24 hours
   - Keyed by model + fingerprint
2. "openai/gpt4":
   - 5 requests per 24 hours
   - Keyed by fingerprint only

### Endpoints

#### WebSocket Endpoint (/ws)
- Handles real-time chat completions
- Request Format:
```typescript
{
  model: string;      // OpenAI model name
  prompt: string;     // User's input
  temperature: number // AI response randomness
}
```
- Response: Streams text chunks until completion, ends with "[DONE]"
- Stores completion data in Firebase Firestore

#### REST Endpoints

1. `GET /api/prompts-remaining`
   - Query Parameters:
     - model: string
     - fp: string (fingerprint)
   - Returns: `{ remaining: number }`

2. `GET /api/moar-prompts`
   - Query Parameters:
     - model: string
     - fp: string
   - Decrements usage count by 3
   - Returns: `{ message: "Decremented" }`

3. `GET /api/use-prompt`
   - Query Parameters:
     - model: string
     - fp: string
   - Increments usage count
   - Returns: `{ message: string }`

4. `GET /api/examples`
   - Returns: Array of example prompts from the examples directory
   - Format: JSON array

5. `GET /api/hello`
   - Simple health check endpoint
   - Returns: `{ message: "Hello from the server!" }`

6. `GET /api/completion`
   - Legacy endpoint
   - Query Parameters:
     - prompt: string
   - Returns: `{ receivedPrompt: string }`

### OpenAI Integration
- Uses OpenAI's Chat Completion API
- Configuration:
  - System prompt limits responses to 100 words
  - Max tokens: 200
  - Temperature: Variable (passed from client)
  - Streaming enabled
  - Single completion (n=1)

### Firebase Integration
- Uses Firebase Admin SDK
- Stores chat completions in Firestore
- Collection: "completions"
- Document structure:
```typescript
{
  model: string;
  prompt: string;
  temperature: number;
  createdAt: Date;
}
```

### Error Handling
- WebSocket errors are sent back to the client as string messages
- Rate limit errors return appropriate HTTP status codes and messages
- Firebase errors are logged but don't interrupt the chat completion flow

### Frontend Integration Notes
1. Use WebSocket for real-time chat interactions
2. Check remaining prompts before starting a chat
3. Monitor rate limits using the prompts-remaining endpoint
4. Handle streaming responses by concatenating chunks until "[DONE]"
5. Implement fingerprinting for rate limiting
6. Use examples endpoint for suggested prompts/templates
