import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { InterviewFeedback, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received feedback data:', data); // Log incoming data
    
    // Insert the interview feedback data into the database
    const result = await db.insert(InterviewFeedback).values({
      mockIdRef: data.mockIdRef,
      userEmail: data.userEmail,
      createdAt: new Date().toISOString(),
      
      // Overall session data
      duration: data.duration.toString(),
      totalMessages: data.totalMessages.toString(),
      averageScore: data.averageScore.toString(),
      
      // Detailed feedback
      conversation: JSON.stringify(data.conversation),
      strengths: JSON.stringify(data.strengths),
      weaknesses: JSON.stringify(data.weaknesses),
      detailedFeedback: JSON.stringify(data.detailedFeedback),
      
      // Individual message analysis
      messageAnalysis: JSON.stringify(data.messageAnalysis)
    });

    console.log('Database insert result:', result); // Log insert result

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save interview feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Fetch all interview feedback data and join with MockInterview to get scenario details
    const result = await db.select({
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
        
        // Include fields from MockInterview
        title: MockInterview.title,
        description: MockInterview.description,
        difficulty: MockInterview.difficulty,
        scenario: MockInterview.scenario, // Original scenario text
        customerQuery: MockInterview.customerQuery,
        expectedResponse: MockInterview.expectedResponse,
        language: MockInterview.language,
        industry: MockInterview.industry,
        role: MockInterview.role,
        mockID: MockInterview.mockID, // The mockID from MockInterview

    })
    .from(InterviewFeedback)
    .innerJoin(MockInterview, eq(InterviewFeedback.mockIdRef, MockInterview.mockID));

    console.log('Fetched joined data:', result); // Log fetched data

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview feedback' },
      { status: 500 }
    );
  }
}

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