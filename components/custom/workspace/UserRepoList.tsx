"use client";

import type { Repository, TestCase } from "@/db";
import React, { useCallback, useContext, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CheckCircle2,
  ListChecks,
  Loader2,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import StatusCard from "./StatusCard";
import TestCaseList from "./TestCaseList";
import { UserDetailsContext } from "@/context/userDetailsContext";
import axios from "axios";

type GenerateTestCasesResponse = {
  success?: boolean;
  testCases?: TestCase[];
  count?: number;
  error?: string;
};

function repoKeyFromRepository(repo: Repository) {
  return String(repo.repoId);
}

const UserRepoList = ({ repoList }: { repoList: Repository[] }) => {
  const { userDetails } = useContext(UserDetailsContext);
  /** DB `repositories.id` for the row currently running generation (only one at a time). */
  const [generatingRepoId, setGeneratingRepoId] = useState<number | null>(null);
  /** Test cases keyed by GitHub `repo_id` (same string as accordion value / API `repoId`). */
  const [testCasesByRepoId, setTestCasesByRepoId] = useState<
    Record<string, TestCase[]>
  >({});
  const [testCasesLoadingByRepoId, setTestCasesLoadingByRepoId] = useState<
    Record<string, boolean>
  >({});

  const fetchTestCases = useCallback(
    async (repoIdParam: string, options?: { invalidate?: boolean }) => {
      if (options?.invalidate) {
        setTestCasesByRepoId((prev) => {
          const next = { ...prev };
          delete next[repoIdParam];
          return next;
        });
      }
      setTestCasesLoadingByRepoId((prev) => ({ ...prev, [repoIdParam]: true }));
      try {
        const { data } = await axios.get<TestCase[]>(`/api/test-cases`, {
          params: { repoId: repoIdParam },
        });
        setTestCasesByRepoId((prev) => ({ ...prev, [repoIdParam]: data }));
      } catch {
        console.error("[UserRepoList] Failed to load test cases");
      } finally {
        setTestCasesLoadingByRepoId((prev) => ({
          ...prev,
          [repoIdParam]: false,
        }));
      }
    },
    [],
  );

  const handleGenerateTestCases = async (repo: Repository) => {
    const userId = userDetails?.id;
    if (userId == null || generatingRepoId !== null) return;

    const key = repoKeyFromRepository(repo);

    try {
      setGeneratingRepoId(repo.id);

      const { data } = await axios.post<GenerateTestCasesResponse>(
        "/api/generate-test-cases",
        {
          userId,
          repoId: repo.repoId,
          owner: repo.owner,
          repo: repo.name,
          branch: repo.defaultBranch,
        },
      );

      if (data.testCases?.length) {
        setTestCasesByRepoId((prev) => ({
          ...prev,
          [key]: data.testCases as TestCase[],
        }));
      } else {
        await fetchTestCases(key);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingRepoId(null);
    }
  };

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        onValueChange={(value) => {
          if (value == null || value === "") return;
          void fetchTestCases(value);
        }}
      >
        {repoList.map((repo) => {
          const key = repoKeyFromRepository(repo);
          const cases = testCasesByRepoId[key] ?? [];
          const isLoadingCases = testCasesLoadingByRepoId[key] === true;

          const totalTests = cases.length;
          const passedTests = cases.filter((c) => c.status === "passed").length;
          const failedTests = cases.filter((c) => c.status === "failed").length;
          const passRate =
            totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

          const isThisRepoGenerating = generatingRepoId === repo.id;
          const isAnyGenerating = generatingRepoId !== null;
          const hasTestCases = cases.length > 0;

          return (
            <AccordionItem value={key} key={repo.repoId}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Image
                    src={"/github-indigo.png"}
                    alt="github"
                    width={30}
                    height={30}
                  />
                  <div className="flex flex-col gap-1 items-start">
                    <h2 className="font-medium">{repo.fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {repo.defaultBranch} · {repo.language} ·{" "}
                      {repo.private ? "Private" : "Public"}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatusCard
                      title="Total Tests"
                      value={isLoadingCases && !hasTestCases ? "—" : totalTests}
                      icon={
                        <ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      }
                      bgColor="bg-blue-500/15 dark:bg-blue-400/20"
                    />
                    <StatusCard
                      title="Passed"
                      value={
                        isLoadingCases && !hasTestCases ? "—" : passedTests
                      }
                      icon={
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      }
                      bgColor="bg-green-500/15 dark:bg-green-400/20"
                    />
                    <StatusCard
                      title="Failed"
                      value={
                        isLoadingCases && !hasTestCases ? "—" : failedTests
                      }
                      icon={
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      }
                      bgColor="bg-red-500/15 dark:bg-red-400/20"
                    />
                    <StatusCard
                      title="Pass Rate"
                      value={
                        isLoadingCases && !hasTestCases ? "—" : `${passRate}%`
                      }
                      icon={
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      }
                      bgColor="bg-purple-500/15 dark:bg-purple-400/20"
                    />
                  </div>

                  {isLoadingCases && !hasTestCases ? (
                    <div
                      className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-6"
                      role="status"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <Loader2
                        className="size-8 animate-spin text-muted-foreground"
                        aria-hidden
                      />
                      <p className="text-sm text-muted-foreground">
                        Loading test cases…
                      </p>
                    </div>
                  ) : hasTestCases ? (
                    <TestCaseList
                      repoId={key}
                      testCases={cases}
                      onRefresh={(rid) =>
                        void fetchTestCases(rid, { invalidate: true })
                      }
                    />
                  ) : (
                    <div className="flex flex-col justify-between gap-4 rounded-xl border bg-gray-50 p-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-medium">Generate AI Test Cases</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Analyze this repository and generate automated test
                          cases using AI.
                        </p>
                      </div>
                      <Button
                        type="button"
                        className="gap-2 shrink-0"
                        disabled={userDetails?.id == null || isAnyGenerating}
                        aria-busy={isThisRepoGenerating}
                        onClick={() => void handleGenerateTestCases(repo)}
                      >
                        {isThisRepoGenerating ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <Sparkles className="h-4 w-4" aria-hidden />
                        )}
                        {isThisRepoGenerating
                          ? "Generating…"
                          : "Generate Test Cases"}
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default UserRepoList;
