"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserDetailsContext } from "@/context/userDetailsContext";
import Image from "next/image";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import EmptyWorkspace from "./EmptyWorkspace";
import axios from "axios";
import { Loader2, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RepoDialog from "./RepoDialog";
import type { Repository } from "@/db/schema";
import UserRepoList from "./UserRepoList";
import { toast } from "sonner";

const WorkspaceBody = () => {
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const { isLoaded: clerkLoaded, userId: clerkUserId } = useAuth();
  const searchParams = useSearchParams();
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
    window.location.href = "/api/github";
  };

  const stripeSuccessHandled = useRef(false);

  useEffect(() => {
    if (searchParams.get("stripe_success") !== "1") return;
    if (stripeSuccessHandled.current) return;
    stripeSuccessHandled.current = true;

    toast.success("Payment received", {
      description: "Your credits will update in a moment.",
      id: "stripe-checkout-success",
    });

    void axios
      .post("/api/users")
      .then(({ data }) => {
        if (data?.user) {
          setUserDetails(data.user);
        }
      })
      .catch(() => {
        /* refreshed on next navigation */
      });

    const path = window.location.pathname;
    window.history.replaceState(null, "", path);
  }, [searchParams, setUserDetails]);

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {userDetails?.stripeCustomerId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={async () => {
                try {
                  const res = await fetch("/api/billing/portal", {
                    method: "POST",
                  });
                  const data = (await res.json()) as {
                    url?: string;
                    error?: string;
                  };
                  if (!res.ok) {
                    toast.error(data.error || "Could not open billing portal.");
                    return;
                  }
                  if (data.url) {
                    window.location.assign(data.url);
                  }
                } catch {
                  toast.error("Could not open billing portal.");
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Billing
            </Button>
          ) : null}
          <p className="text-sm text-indigo-400 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-100 rounded-md px-2 py-1">
            Remaining credits: {userDetails?.credits}
          </p>
        </div>
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
          <UserRepoList
            repoList={userRepoList}
            githubConnected={Boolean(githubToken)}
            onRepoUpdated={(updated) =>
              setUserRepoList((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r)),
              )
            }
          />
        )}
      </div>
    </section>
  );
};

export default WorkspaceBody;
