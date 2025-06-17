import {chatSession} from "./GeminiAIModal";

export const analyzeResponse = async (response, scenario) => {
    try {
        const prompt = `Phân tích câu trả lời phỏng vấn này trong bối cảnh tình huống sau. Hãy trả về kết quả dưới dạng JSON với cấu trúc:
    {
      "diem_manh": ["danh sách các điểm mạnh"],
      "diem_can_cai_thien": ["danh sách các điểm cần cải thiện"],
      "diem_so": số từ 0-100,
      "phan_hoi": "nhận xét ngắn gọn"
    }

    Tình huống: ${scenario}
    Câu trả lời: ${response}`;

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