import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";


const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/forum(.*)'
])
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const {userId} = await auth();
    if (userId && isAuthPage(req)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (!userId && isProtectedRoute(req)) {
        await auth.protect();
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};