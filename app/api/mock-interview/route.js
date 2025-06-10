import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found or user not authenticated" }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    const data = await request.json();
    
    // Insert the mock interview data into the database
    const result = await db.insert(MockInterview).values({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      scenario: data.scenario,
      customerQuery: data.customerQuery,
      expectedResponse: data.expectedResponse,
      language: data.language,
      industry: data.industry,
      role: data.role,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      mockID: data.mockID,
      userEmail: userEmail,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving mock interview:', error);
    return NextResponse.json(
      { error: 'Failed to save mock interview' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');

    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    // Fetch the mock interview data from the database
    const result = await db.select()
      .from(MockInterview)
      .where(eq(MockInterview.mockID, mockId))
      .limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Mock interview not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching mock interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mock interview' },
      { status: 500 }
    );
  }
} 