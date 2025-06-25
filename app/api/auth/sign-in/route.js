import {NextResponse} from "next/server";
import {isUserExists} from "@/utils/helpers";
import {Clerk} from "@clerk/clerk-sdk-node";
import {createClerkClient} from "@clerk/backend";

const clerk = createClerkClient({secretKey: process.env.CLERK_SECRET_KEY});

export async function POST(request) {
    try {
        const {emailOrUsername, password} = await request.json();

        if (!emailOrUsername || !password) {
            throw new Error("All fields are required");
        }

        const existUser = await isUserExists({email: emailOrUsername, username: emailOrUsername});

        if (!existUser) {
            throw new Error("User not found");
        }

        if (!existUser.password) {
            throw new Error("This account is signed in by Google or Facebook");
        }

        const signIn = await clerk.signInTokens.createSignInToken({
            identifier: emailOrUsername,
            password,
            username: emailOrUsername,
            userId: existUser.id,
        });

        if (signIn.status !== "complete") {
            return NextResponse.json({error: "Sign in not complete"}, {status: 400});
        }

        const session = await clerk.sessions.createSession({userId: signIn.userId});
        const res = NextResponse.json({success: true, session: session});
        // await clerk.sessions.({session, res});

        return res;
    } catch (error) {
        console.error('Error signing in:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            {error: 'Failed to sign in'},
            {status: 500}
        );
    }
}
