import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';

export async function POST(request) {
  try {
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
      mockID: data.mockID
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