import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { InterviewFeedback, MockInterview } from '@/utils/schema';
import { eq, sql } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found or user not authenticated" }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    // Fetch only the necessary fields for displaying interview cards
    const result = await db.select({
      // From MockInterview table
      id: MockInterview.id,
      title: MockInterview.title,
      difficulty: MockInterview.difficulty,
      industry: MockInterview.industry,
      mockID: MockInterview.mockID,
      
      // From InterviewFeedback table
      duration: InterviewFeedback.duration,
      averageScore: InterviewFeedback.averageScore,
      createdAt: InterviewFeedback.createdAt,
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