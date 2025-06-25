import bcrypt from "bcrypt";
import {db} from "@/utils/db";
import {User} from "@/utils/schema";
import {eq, or} from "drizzle-orm";

export async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

export async function createAccount({fullName = null, username, password = null, email}) {
    try {
        await db.insert(User).values({
            fullName,
            username,
            email,
            password: password ? await hashPassword(password) : null,
        });
    } catch (error) {
        throw error;
    }
}

export async function isUserExists({email, username}) {
    try {
        const [user] = await db
            .select()
            .from(User)
            .where(
                or(
                    eq(User.email, email),
                    eq(User.username, username)
                )
            )
            .limit(1);
        return user || null;
    } catch (error) {
        throw error;
    }
}
