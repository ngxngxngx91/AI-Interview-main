import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createAccount, isUserExists } from "@/utils/helpers";
import { User } from "@/utils/schema";
import { db } from "@/utils/db";
import { ilike, sql } from "drizzle-orm";

export async function GET(req) {
    try {
        const cookieHeader = req.headers.get("cookie");
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error get user account:", error);
        return NextResponse.json(
            { error: "Failed to get user account" },
            { status: 500 }
        );
    }
}
