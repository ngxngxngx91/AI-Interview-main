const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 0.5,
    topP: 0.9,
    topK: 20,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
};


export const chatSession = model.startChat({
    generationConfig,
});

// Retry wrapper for scenario generation
export async function generateWithRetry(prompt, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await chatSession.sendMessage(prompt);
            const responseText = await result.response.text();
            return responseText;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError;
}
  