import { db } from '@/utils/db';
import { InterviewFeedback } from "../../../utils/schema";
import { sql, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    console.log("Fetching highest score for user:", userEmail);

    // Get the highest score using the decimal type
    const result = await db.select({
      highestScore: sql`COALESCE(MAX(${InterviewFeedback.averageScore}), 0)`
    })
    .from(InterviewFeedback)
    .where(eq(InterviewFeedback.userEmail, userEmail));

    console.log("Query result:", result);

    const highestScore = result[0]?.highestScore || 0;
    console.log("Final highest score:", highestScore);

    return new Response(JSON.stringify({ highestScore }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching highest score:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch highest score" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
} 