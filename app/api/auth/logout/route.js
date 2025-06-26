import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.redirect(new URL("/", process.env.WEBSITE_URL));

    res.cookies.set("token", "", {
        httpOnly: true,
        secure: true,
        path: "/",
        expires: new Date(0),
    });

    return res;
}
