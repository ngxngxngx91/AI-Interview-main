import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { InterviewFeedback, MockInterview } from '@/utils/schema';
import { eq, sql } from 'drizzle-orm';

// API endpoint để lưu phản hồi phỏng vấn mới
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received feedback data:', data);
    
    // Đảm bảo các trường mảng luôn có thể chuyển đổi thành JSON
    const conversationData = data.conversation || [];
    const strengthsData = data.strengths || [];
    const weaknessesData = data.weaknesses || [];
    const detailedFeedbackData = data.detailedFeedback || [];
    const messageAnalysisData = data.messageAnalysis || [];

    // Lưu dữ liệu phản hồi phỏng vấn vào cơ sở dữ liệu
    const result = await db.insert(InterviewFeedback).values({
      mockIdRef: data.mockIdRef,
      userEmail: data.userEmail,
      createdAt: new Date().toISOString(),
      
      // Dữ liệu tổng quan về phiên phỏng vấn
      duration: data.duration.toString(),
      totalMessages: data.totalMessages.toString(),
      averageScore: parseFloat(data.averageScore),
      
      // Phản hồi chi tiết
      conversation: JSON.stringify(conversationData),
      strengths: JSON.stringify(strengthsData),
      weaknesses: JSON.stringify(weaknessesData),
      detailedFeedback: JSON.stringify(detailedFeedbackData),
      
      // Phân tích từng tin nhắn
      messageAnalysis: JSON.stringify(messageAnalysisData)
    });

    console.log('Database insert result:', result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save interview feedback' },
      { status: 500 }
    );
  }
}

// API endpoint để lấy phản hồi phỏng vấn theo mockId
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');

    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    // Truy vấn dữ liệu phản hồi kèm thông tin kịch bản phỏng vấn
    const result = await db.select({
      // Các trường từ bảng InterviewFeedback
      id: InterviewFeedback.id,
      mockIdRef: InterviewFeedback.mockIdRef,
      userEmail: InterviewFeedback.userEmail,
      createdAt: InterviewFeedback.createdAt,
      duration: InterviewFeedback.duration,
      totalMessages: InterviewFeedback.totalMessages,
      averageScore: InterviewFeedback.averageScore,
      conversation: InterviewFeedback.conversation,
      strengths: InterviewFeedback.strengths,
      weaknesses: InterviewFeedback.weaknesses,
      detailedFeedback: InterviewFeedback.detailedFeedback,
      messageAnalysis: InterviewFeedback.messageAnalysis,
      
      // Các trường từ bảng MockInterview
      scenario: {
        title: MockInterview.title,
        description: MockInterview.description,
        difficulty: MockInterview.difficulty,
        scenario: MockInterview.scenario,
        customerQuery: MockInterview.customerQuery,
        expectedResponse: MockInterview.expectedResponse,
        language: MockInterview.language,
        industry: MockInterview.industry,
        role: MockInterview.role
      }
    })
    .from(InterviewFeedback)
    .leftJoin(MockInterview, eq(InterviewFeedback.mockIdRef, MockInterview.mockID))
    .where(eq(InterviewFeedback.mockIdRef, mockId))
    .orderBy(sql`${InterviewFeedback.createdAt} DESC`)
    .limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview feedback' },
      { status: 500 }
    );
  }
}

// API endpoint để xóa phản hồi phỏng vấn
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockIdToDelete = searchParams.get('mockId');

    if (!mockIdToDelete) {
      return NextResponse.json(
        { error: 'mockId is required for DELETE' },
        { status: 400 }
      );
    }

    console.log('Deleting feedback for mockId:', mockIdToDelete);

    // Xóa phản hồi phỏng vấn dựa trên mockId
    const result = await db.delete(InterviewFeedback)
      .where(eq(InterviewFeedback.mockIdRef, mockIdToDelete));

    console.log('Delete result:', result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview feedback' },
      { status: 500 }
    );
  }
} 