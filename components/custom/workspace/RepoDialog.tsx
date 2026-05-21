"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TGitHubRepoListItem } from "@/types";
import { UserDetailsContext } from "@/context/userDetailsContext";
import { cn } from "@/lib/utils";
import { GitBranch, Lock, Search } from "lucide-react";
import axios from "axios";

type RepoDialogProps = {
  onRepoAdded?: () => void | Promise<void>;
};

const RepoDialog = ({ onRepoAdded }: RepoDialogProps) => {
  const { userDetails } = useContext(UserDetailsContext);
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<TGitHubRepoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    void axios
      .get<TGitHubRepoListItem[]>("/api/github/repos")
      .then(({ data }) => {
        if (!cancelled) setRepos(data);
      })
      .catch(() => {
        if (!cancelled) setRepos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, search]);

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === selectedId) ?? null,
    [repos, selectedId],
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setSelectedId(null);
      setRepos([]);
      setSaving(false);
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedRepo == null || userDetails == null) return;
    setSaving(true);
    try {
      await axios.post("/api/github/user-repo", {
        id: selectedRepo.id,
        userId: userDetails.id,
        name: selectedRepo.name,
        fullName: selectedRepo.fullName,
        private: selectedRepo.private,
        htmlUrl: selectedRepo.htmlUrl,
        defaultBranch: selectedRepo.defaultBranch,
        owner: selectedRepo.owner,
        description: selectedRepo.description ?? "",
        language: selectedRepo.language ?? "",
      });
      await onRepoAdded?.();
      handleOpenChange(false);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(e.response?.data ?? e.message);
      } else {
        console.error(e);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <GitBranch />
          Add repository
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-4 sm:max-w-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Add repository</DialogTitle>
          <DialogDescription>
            Search by full name (e.g. owner/repo) and select a repository.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by repository name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-background py-1 pl-8 pr-3 text-sm text-foreground shadow-sm",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
              autoComplete="off"
            />
          </div>

          <ul
            role="listbox"
            aria-label="Your repositories"
            className="max-h-[min(320px,40vh)] min-h-[140px] overflow-y-auto rounded-md border border-border"
          >
            {loading ? (
              <li className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                Loading repositories…
              </li>
            ) : filteredRepos.length === 0 ? (
              <li className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                {repos.length === 0
                  ? "No repositories loaded."
                  : "No repositories match your search."}
              </li>
            ) : (
              filteredRepos.map((repo) => {
                const isSelected = selectedId === repo.id;
                return (
                  <li key={repo.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedId(repo.id)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2.5 text-left text-sm transition-colors last:border-b-0",
                        "hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                        isSelected &&
                          "bg-accent text-accent-foreground hover:bg-accent",
                      )}
                    >
                      <span className="flex w-full items-center gap-2 font-medium">
                        <span className="truncate">{repo.fullName}</span>
                        {repo.private ? (
                          <Lock
                            className="size-3.5 shrink-0 opacity-70"
                            aria-label="Private repository"
                          />
                        ) : null}
                      </span>
                      {repo.description ? (
                        <span className="line-clamp-1 text-xs font-normal text-muted-foreground">
                          {repo.description}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:justify-end sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={selectedRepo == null || userDetails == null || saving}
            onClick={() => void handleConfirmAdd()}
          >
            {saving ? "Saving…" : "Add repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepoDialog;
