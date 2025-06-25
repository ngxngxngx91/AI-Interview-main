import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createAccount, isUserExists } from "@/utils/helpers";
import { User } from "@/utils/schema";
import { db } from "@/utils/db";
import { ilike, sql } from "drizzle-orm";

export async function POST(req) {
    try {
        const payload = await req.text();
        const headerPayload = Object.fromEntries(await headers());
        const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

        let evt;

        try {
            evt = svix.verify(payload, headerPayload);
        } catch (err) {
            console.error("Webhook verification failed", err);
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        const eventType = evt.type;

        if (eventType === "user.created") {
            const data = evt.data;
            const email =
                data.external_accounts[0]?.email_address ||
                data.email_addresses[0]?.email_address;

            // Check if the user already exists
            const existingUser = await isUserExists({
                email,
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
                    fullName:
                        data.external_accounts[0]?.given_name ||
                        data.first_name + " " + data.last_name,
                    username: `#user${oauthUserCount}`,
                    password: null,
                    email,
                });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error creating account:", error);
        return NextResponse.json(
            { error: "Failed to create a new account" },
            { status: 500 }
        );
    }
}
