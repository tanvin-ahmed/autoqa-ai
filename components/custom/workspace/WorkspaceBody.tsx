"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserDetailsContext } from "@/context/userDetailsContext";
import Image from "next/image";
import React, { useCallback, useContext, useEffect, useState } from "react";
import EmptyWorkspace from "./EmptyWorkspace";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RepoDialog from "./RepoDialog";
import type { Repository } from "@/db/schema";
import { Loader2 } from "lucide-react";
import UserRepoList from "./UserRepoList";

const WorkspaceBody = () => {
  const { userDetails } = useContext(UserDetailsContext);
  const { isLoaded: clerkLoaded, userId: clerkUserId } = useAuth();
  const router = useRouter();
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [userRepoList, setUserRepoList] = useState<Repository[]>([]);
  /** False until GET /api/github/user-repo finishes for the current `userDetails.id` (initial load only). */
  const [reposReady, setReposReady] = useState(false);

  const userIdNum = userDetails?.id;

  const showRepoSectionLoader =
    !clerkLoaded ||
    (Boolean(clerkUserId) && userDetails === null) ||
    (userIdNum != null && !reposReady);

  const handleAddRepository = () => {
    router.push("/api/github");
  };

  const handleGetGithubToken = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/github/token");
      setGithubToken(data.accessToken);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleGetUserRepos = useCallback(
    async (background = false) => {
      const id = userDetails?.id;
      if (id == null) return;

      try {
        const { data } = await axios.get<Repository[]>(
          "/api/github/user-repo",
          {
            params: { userId: id },
          },
        );
        setUserRepoList(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setUserRepoList([]);
        } else {
          console.error(error);
          setUserRepoList([]);
        }
      } finally {
        if (!background) setReposReady(true);
      }
    },
    [userDetails?.id],
  );

  useEffect(() => {
    handleGetGithubToken();
  }, [handleGetGithubToken]);

  useEffect(() => {
    if (userIdNum == null) {
      setUserRepoList([]);
      setReposReady(false);
      return;
    }
    setReposReady(false);
    void handleGetUserRepos(false);
  }, [userIdNum, handleGetUserRepos]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Workspace</h1>
        <p className="text-sm text-indigo-400 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-100 rounded-md px-2 py-1">
          Remaining credits: {userDetails?.credits}
        </p>
      </div>

      <Card className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <Image
            src={"/github-indigo.png"}
            alt="github"
            width={40}
            height={40}
          />
          <h3 className="text-lg font-bold">Connect github & add repository</h3>
        </div>
        {!githubToken ? (
          <Button variant="default" onClick={handleAddRepository}>
            Connect github
          </Button>
        ) : (
          <RepoDialog onRepoAdded={() => void handleGetUserRepos(true)} />
        )}
      </Card>

      <div className="pt-6">
        {showRepoSectionLoader ? (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-16"
          >
            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium text-muted-foreground">
              {!clerkLoaded || (clerkUserId && userDetails === null)
                ? "Loading your workspace…"
                : "Loading your repositories…"}
            </p>
          </div>
        ) : userRepoList.length === 0 ? (
          <EmptyWorkspace />
        ) : (
          <UserRepoList repoList={userRepoList} />
        )}
      </div>
    </section>
  );
};

export default WorkspaceBody;
