import { NextResponse } from "next/server";
import { oauthProviders } from "@/lib/oauth-providers";

export async function GET(req, { params }) {
    const awaitedParams = await params;
    const provider = oauthProviders[awaitedParams.provider];
    if (!provider)
        return NextResponse.json(
            { error: "Invalid provider" },
            { status: 400 }
        );

    const redirectUri = `${process.env.WEBSITE_URL}/api/auth/${awaitedParams.provider}/callback`;

    const url = new URL(provider.authUrl);
    url.searchParams.set("client_id", provider.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", provider.scope);

    return NextResponse.redirect(url.toString());
}
