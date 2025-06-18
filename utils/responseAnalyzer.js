import {chatSession} from "./GeminiAIModal";

export const analyzeResponse = async (response, scenario) => {
    try {
        const prompt = `Phân tích câu trả lời phỏng vấn này trong bối cảnh tình huống sau. Hãy trả về kết quả dưới dạng JSON với cấu trúc:
    {
      "strengths": ["danh sách các điểm mạnh bằng tiếng Việt"],
      "weaknesses": ["danh sách các điểm cần cải thiện bằng tiếng Việt"],
      "overallScore": số từ 0-100,
      "feedback": "nhận xét ngắn gọn bằng tiếng Việt"
    }

    Lưu ý: Tất cả nội dung trong strengths, weaknesses, và feedback phải được viết bằng tiếng Việt, chỉ giữ nguyên tên các trường JSON bằng tiếng Anh.

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
            feedback: "Không thể phân tích câu trả lời",
            timestamp: new Date().toISOString()
        };
    }
}; 