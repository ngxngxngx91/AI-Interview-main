import { generateWithRetry } from "./GeminiAIModal";

export const analyzeResponse = async (response, scenario) => {
    try {
        const prompt = `Bạn là một chuyên gia phỏng vấn. Hãy phân tích câu trả lời phỏng vấn dưới đây trong bối cảnh tình huống sau. Hãy trả về kết quả dưới dạng JSON với cấu trúc:
{
  "strengths": ["danh sách các điểm mạnh bằng tiếng Việt"],
  "weaknesses": ["danh sách các điểm cần cải thiện bằng tiếng Việt"],
  "overallScore": số từ 0-100 (càng cao càng tốt, không làm tròn số, hãy sử dụng các số lẻ nếu phù hợp),
  "feedback": "nhận xét ngắn gọn bằng tiếng Việt, tham chiếu cụ thể đến câu trả lời"
}

Hãy đánh giá điểm số như sau:
- 0-30: Câu trả lời yếu, thiếu ý hoặc sai trọng tâm.
- 31-60: Câu trả lời trung bình, có ý đúng nhưng chưa sâu sắc.
- 61-85: Câu trả lời tốt, đầy đủ ý, có ví dụ minh họa.
- 86-100: Câu trả lời xuất sắc, rất thuyết phục và chuyên nghiệp.

Ví dụ:
Tình huống: "Bạn hãy giới thiệu về bản thân."
Câu trả lời: "Tôi tên là Nam, tôi đã có 3 năm kinh nghiệm làm việc trong lĩnh vực IT..."
Kết quả mẫu:
{
  "strengths": ["Giới thiệu rõ ràng về bản thân", "Nêu bật kinh nghiệm làm việc"],
  "weaknesses": ["Chưa đề cập đến kỹ năng mềm"],
  "overallScore": 78,
  "feedback": "Bạn đã giới thiệu tốt về kinh nghiệm, tuy nhiên nên bổ sung thêm kỹ năng mềm."
}

Lưu ý: Tất cả nội dung trong strengths, weaknesses, và feedback phải được viết bằng tiếng Việt, chỉ giữ nguyên tên các trường JSON bằng tiếng Anh.

Tình huống: ${scenario}
Câu trả lời: ${response}`;

        const resultText = await generateWithRetry(prompt);
        console.log('Raw AI output:', resultText); // Log raw output for debugging
        let analysis;
        try {
            analysis = JSON.parse(resultText);
        } catch (jsonError) {
            // Attempt to extract score and fields with regex if JSON parsing fails
            const scoreMatch = resultText.match(/"overallScore"\s*:\s*(\d+)/);
            const strengthsMatch = resultText.match(/"strengths"\s*:\s*\[(.*?)\]/s);
            const weaknessesMatch = resultText.match(/"weaknesses"\s*:\s*\[(.*?)\]/s);
            const feedbackMatch = resultText.match(/"feedback"\s*:\s*"([^"]*)"/);
            analysis = {
                strengths: strengthsMatch ? strengthsMatch[1].split(',').map(s => s.replace(/\"/g, '').trim()) : [],
                weaknesses: weaknessesMatch ? weaknessesMatch[1].split(',').map(s => s.replace(/\"/g, '').trim()) : [],
                overallScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
                feedback: feedbackMatch ? feedbackMatch[1] : "Không thể phân tích câu trả lời"
            };
        }

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