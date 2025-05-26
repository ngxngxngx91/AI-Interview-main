import {chatSession} from "./GeminiAIModal";

export const analyzeResponse = async (response, scenario) => {
    try {
        const prompt = `Analyze this interview response in the context of the following scenario. Provide a JSON response with:
    {
      "strengths": ["list of strengths"],
      "weaknesses": ["list of weaknesses"],
      "overallScore": number between 0-100,
      "feedback": "brief feedback"
    }

    Scenario: ${scenario}
    Response: ${response}`;

        const result = await chatSession.sendMessage(prompt);
        const analysis = JSON.parse(result.response.text());

        return {
            ...analysis,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error analyzing response:', error);
        return {
            strengths: [],
            weaknesses: [],
            overallScore: 0,
            feedback: "Unable to analyze response",
            timestamp: new Date().toISOString()
        };
    }
}; 