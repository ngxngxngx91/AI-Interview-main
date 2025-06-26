import { NextResponse } from "next/server";
import { createAccount, isUserExists } from "@/utils/helpers";
import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request) {
    try {
        const { fullName, username, email, password } = await request.json();

        if (!username || !email || !password) {
            throw new Error("Username, email and password are required");
        }

        const isExistUser = await isUserExists({ email, username });

        if (isExistUser) {
            throw new Error("User with email or username already exists");
        }

        await clerk.users.createUser({
            emailAddress: [email],
            password,
            username,
        });
        await createAccount({ fullName, username, password, email });

        return NextResponse.json({
            success: true,
            message: "Successfully signed up",
        });
    } catch (error) {
        const errorResponse = JSON.stringify(error, null, 2);
        console.error("Error signing up:", errorResponse);
        return NextResponse.json(
            { error: "Failed to sign up" },
            { status: 500 }
        );
    }
}
