import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { MockInterview, InterviewFeedback } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromCookie } from '@/lib/auth';

// API endpoint để xóa một buổi phỏng vấn
export async function DELETE(request, { params }) {
  try {
    // Kiểm tra xác thực người dùng
    const user = await getUserFromCookie();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found or user not authenticated" }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    const { mockId } = params;

    // Xóa phản hồi phỏng vấn trước
    await db.delete(InterviewFeedback)
      .where(eq(InterviewFeedback.mockIdRef, mockId));

    // Sau đó xóa buổi phỏng vấn
    await db.delete(MockInterview)
      .where(and(
        eq(MockInterview.mockID, mockId),
        eq(MockInterview.userEmail, userEmail)
      ));

    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    );
  }
} 