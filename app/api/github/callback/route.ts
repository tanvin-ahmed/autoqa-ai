import { NextRequest, NextResponse } from "next/server";

type GitHubTokenJson =
  | { access_token: string; scope?: string; token_type?: string }
  | { error: string; error_description?: string };

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/workspace?error=missing_code", request.url),
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("[github/callback] Missing GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, or GITHUB_REDIRECT_URI");
    return NextResponse.redirect(
      new URL("/workspace?error=server_config", request.url),
    );
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await tokenRes.json()) as GitHubTokenJson;

  if ("error" in data) {
    console.error("[github/callback] GitHub token error:", data.error, data.error_description);
    return NextResponse.redirect(
      new URL(
        `/workspace?error=${encodeURIComponent(data.error)}`,
        request.url,
      ),
    );
  }

  const accessToken = data.access_token;
  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/workspace?error=missing_token", request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/workspace", request.url));

  response.cookies.set({
    name: "github_access_token",
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
