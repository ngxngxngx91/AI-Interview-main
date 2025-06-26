import { db } from '@/utils/db';
import { InterviewFeedback } from "../../../utils/schema";
import { sql, eq } from 'drizzle-orm';
import { getUserFromCookie } from '@/lib/auth';

// API endpoint để lấy điểm cao nhất của người dùng
export async function GET() {
  try {
    // Kiểm tra xác thực người dùng thông qua Clerk
    const user = await getUserFromCookie();
    
    // Kiểm tra nếu người dùng chưa đăng nhập hoặc không có email
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    console.log("Fetching highest score for user:", userEmail);

    // Truy vấn SQL để lấy điểm cao nhất của người dùng
    // Sử dụng COALESCE để trả về 0 nếu không có điểm nào
    const result = await db.select({
      highestScore: sql`COALESCE(MAX(${InterviewFeedback.averageScore}), 0)`
    })
    .from(InterviewFeedback)
    .where(eq(InterviewFeedback.userEmail, userEmail));

    console.log("Query result:", result);

    // Lấy điểm cao nhất từ kết quả truy vấn, mặc định là 0 nếu không có kết quả
    const highestScore = result[0]?.highestScore || 0;
    console.log("Final highest score:", highestScore);

    // Trả về kết quả thành công với điểm cao nhất
    return new Response(JSON.stringify({ highestScore }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Xử lý lỗi nếu có vấn đề trong quá trình truy vấn
    console.error("Error fetching highest score:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch highest score" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
} 