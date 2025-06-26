import { NextResponse } from "next/server";
import { isUserExists, verifyPassword } from "@/utils/helpers";
import { SignJWT } from "jose";

export async function POST(request) {
    try {
        const { emailOrUsername, password } = await request.json();

        if (!emailOrUsername || !password) {
            throw new Error("All fields are required");
        }

        const existUser = await isUserExists({
            email: emailOrUsername,
            username: emailOrUsername,
        });

        if (!existUser) {
            throw new Error("User not found");
        }

        if (!existUser.password) {
            throw new Error("This account is signed in by Google or Facebook");
        }

        // Check password
        const isPasswordValid = await verifyPassword(
            password,
            existUser.password
        );
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Username, email or password is incorrect." },
                { status: 400 }
            );
        }

        const res = NextResponse.redirect(
            new URL("/dashboard", process.env.WEBSITE_URL)
        );
        const token = await new SignJWT({
            email: emailOrUsername.includes("@") ? emailOrUsername : "",
            username: emailOrUsername.includes("@") ? "" : emailOrUsername,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 3600,
        });

        return res;
    } catch (error) {
        console.error("Error signing in:", error);
        return NextResponse.json(
            { error: "Failed to sign in" },
            { status: 500 }
        );
    }
}
