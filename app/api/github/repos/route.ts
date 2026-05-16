import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { mapGitHubApiRepoToListItem, type TGitHubRepo } from "@/types";

const MAX_PAGES = 30; // 100 repos per page → 3000 max (guard against runaway loops)

type GitHubErrorBody = {
  message?: string;
  documentation_url?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("github_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos: TGitHubRepo[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      console.error(data);
      const err = data as GitHubErrorBody;
      return NextResponse.json(
        {
          error: err.message ?? "GitHub API error",
          status: response.status,
        },
        { status: response.status },
      );
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Unexpected response from GitHub" },
        { status: 502 },
      );
    }

    if (data.length === 0) {
      break;
    }

    repos.push(...(data as TGitHubRepo[]));

    if (data.length < 100) {
      break;
    }
  }

  return NextResponse.json(repos.map(mapGitHubApiRepoToListItem));
}
