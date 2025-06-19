const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelNames = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-exp"
];

const generationConfig = {
    temperature: 0.5,
    topP: 0.9,
    topK: 20,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
};

// Returns a chatSession for a given model name
function getChatSession(modelName) {
    const model = genAI.getGenerativeModel({ model: modelName });
    return model.startChat({ generationConfig });
}

// Retry wrapper with model fallback
export async function generateWithRetry(prompt, maxRetries = 3) {
    let lastError;
    for (const modelName of modelNames) {
        const chatSession = getChatSession(modelName);
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await chatSession.sendMessage(prompt);
                const responseText = await result.response.text();
                return responseText;
            } catch (err) {
                lastError = err;
            }
        }
    }
    throw lastError;
}
  