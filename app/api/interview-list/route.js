import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { InterviewFeedback, MockInterview } from '@/utils/schema';
import { eq, sql } from 'drizzle-orm';
import { getUserFromCookie } from '@/lib/auth';

// API endpoint để lấy danh sách phỏng vấn của người dùng
export async function GET() {
  try {
    // Kiểm tra xác thực người dùng
    const user = await getUserFromCookie();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found or user not authenticated" }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    // Truy vấn các trường cần thiết để hiển thị thông tin phỏng vấn
    const result = await db.select({
      // Thông tin từ bảng MockInterview
      id: MockInterview.id,
      title: MockInterview.title,
      difficulty: MockInterview.difficulty,
      industry: MockInterview.industry,
      mockID: MockInterview.mockID,
      
      // Thông tin từ bảng InterviewFeedback
      duration: InterviewFeedback.duration,
      averageScore: InterviewFeedback.averageScore,
      createdAt: InterviewFeedback.createdAt,
      conversation: InterviewFeedback.conversation,
    })
    .from(MockInterview)
    .leftJoin(InterviewFeedback, eq(MockInterview.mockID, InterviewFeedback.mockIdRef))
    .where(eq(MockInterview.userEmail, userEmail))
    .orderBy(sql`${InterviewFeedback.createdAt} DESC`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching interview list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview list' },
      { status: 500 }
    );
  }
} 