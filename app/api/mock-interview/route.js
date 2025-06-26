import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { getUserFromCookie } from '@/lib/auth';

// API endpoint để tạo phỏng vấn mới
export async function POST(request) {
  try {
    // Kiểm tra xác thực người dùng
    const user = await getUserFromCookie();

    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found or user not authenticated" }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0].emailAddress;

    const data = await request.json();
    
    // Lưu thông tin phỏng vấn mới vào cơ sở dữ liệu
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

// API endpoint để lấy thông tin chi tiết của một phỏng vấn
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');

    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    // Truy vấn thông tin chi tiết của phỏng vấn từ cơ sở dữ liệu
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