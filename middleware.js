import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

function isProtectedRoute(path) {
    return path.startsWith("/dashboard") || path.startsWith("/forum");
}

function isAuthPage(path) {
    return path.startsWith("/sign-in") || path.startsWith("/sign-up");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const token = req.cookies.get("token")?.value;
    const pathname = req.nextUrl.pathname;

    let isValid = false;

    if (token) {
        try {
            await jwtVerify(token, secret);
            isValid = true;
        } catch (e) {
            isValid = false;
        }
    }

    if (isValid && isAuthPage(pathname)) {
        return NextResponse.redirect(
            new URL("/dashboard", process.env.WEBSITE_URL)
        );
    }

    if (!isValid && isProtectedRoute(pathname)) {
        return NextResponse.redirect(
            new URL("/sign-in", process.env.WEBSITE_URL)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
