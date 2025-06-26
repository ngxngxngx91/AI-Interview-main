import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/utils/db";
import { User } from "@/utils/schema";
import { eq, or } from "drizzle-orm";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromCookie() {
    try {
        const cookiesList = await cookies();
        const token = cookiesList.get("token")?.value;
        if (!token) return null;

        const { payload } = await jwtVerify(token, secret);
        if (payload.email || payload.username) {
            const result = await db
                .select()
                .from(User)
                .where(
                    or(
                        eq(User.email, payload.email || ""),
                        eq(User.username, payload.username || "")
                    )
                );

            if (result.length > 0) {
                return {
                    id: result[0].id,
                    email: result[0].email,
                    emailAddresses: [{ emailAddress: result[0].email }],
                    primaryEmailAddress: { emailAddress: result[0].email },
                    username: result[0].username,
                    fullName: result[0].fullName,
                };
            }
            return null;
        }

        return null;
    } catch (e) {
        return null;
    }
}
