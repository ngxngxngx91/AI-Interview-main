import { NextResponse } from "next/server";
import { oauthProviders } from "@/lib/oauth-providers";
import { User } from "@/utils/schema";
import { createAccount, isUserExists } from "@/utils/helpers";
import { db } from "@/utils/db";
import { sql } from "drizzle-orm";
import { SignJWT } from "jose";

export async function GET(req, { params }) {
    const awaitedParams = await params;
    const provider = oauthProviders[awaitedParams.provider];
    if (!provider)
        return NextResponse.json(
            { error: "Invalid provider" },
            { status: 400 }
        );

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/login", req.url));

    const redirectUri = `${process.env.WEBSITE_URL}/api/auth/${awaitedParams.provider}/callback`;

    const tokenRes = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: provider.clientId,
            client_secret: provider.clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch(provider.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await userRes.json();

    // Check if the user already exists
    const existingUser = await isUserExists({
        email: user.email,
        username: "",
    });

    if (!existingUser) {
        const result = await db
            .select({
                count: sql`count(*)`,
            })
            .from(User);

        const oauthUserCount = result[0]?.count
            ? Number(result[0]?.count) + 1
            : 1;
        await createAccount({
            fullName: user.name || "",
            username: `#user${oauthUserCount}`,
            password: null,
            email: user.email,
        });
    }

    const res = NextResponse.redirect(
        new URL("/dashboard", process.env.WEBSITE_URL)
    );
    const token = await new SignJWT({
        email: user.email,
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
}
