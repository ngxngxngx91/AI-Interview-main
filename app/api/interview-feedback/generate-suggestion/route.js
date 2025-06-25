import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { weakness } = await req.json();
        if (!weakness) {
            return NextResponse.json({ error: 'Missing weakness' }, { status: 400 });
        }
        // Compose a prompt for Gemini
        const prompt = `Bạn là chuyên gia huấn luyện phỏng vấn. Hãy đưa ra một gợi ý ngắn gọn, cụ thể và thực tế (1-2 câu) giúp cải thiện điểm yếu sau trong trả lời phỏng vấn: "${weakness}". Gợi ý phải bằng tiếng Việt, tập trung vào cách cải thiện rõ ràng, không chung chung.`;
        const { generateWithRetry } = await import("@/utils/GeminiAIModal");
        const suggestion = await generateWithRetry(prompt);
        return NextResponse.json({ suggestion }, { status: 200 });
    } catch (error) {
        console.error('Error generating suggestion:', error);
        return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
    }
} 