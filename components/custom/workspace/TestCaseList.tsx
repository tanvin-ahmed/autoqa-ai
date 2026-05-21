"use client";

import type { TestCase, Repository } from "@/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Play, RefreshCcw, Route } from "lucide-react";
import { useContext, useState } from "react";
import TestcaseSettingsDialog from "./TestcaseSettingsDialog";
import TestExecutionModal from "./TestExuctionDialog";
import { UserDetailsContext } from "@/context/userDetailsContext";
import {
  hasNoCredits,
  toastPayBeforeRunning,
} from "@/lib/insufficient-credits-toast";

type TestCaseListProps = {
  repoId: string;
  repository: Repository;
  testCases: TestCase[];
  onRefresh: (repoId: string) => void | Promise<void>;
  onTestCaseUpdated?: (updated: TestCase) => void;
};

const TestCaseList = ({
  repoId,
  repository,
  testCases,
  onRefresh,
  onTestCaseUpdated,
}: TestCaseListProps) => {
  const { userDetails } = useContext(UserDetailsContext);
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);
  const [runDialogOpen, setRunDialogOpen] = useState(false);

  const selectedCount = selectedTestCases.length;

  function toggleSelected(tc: TestCase, checked: boolean) {
    setSelectedTestCases((prev) => {
      if (checked) {
        if (prev.some((s) => s.id === tc.id)) return prev;
        return [...prev, tc];
      }
      return prev.filter((s) => s.id !== tc.id);
    });
  }

  function handleTestCaseUpdated(updated: TestCase) {
    onTestCaseUpdated?.(updated);
    setSelectedTestCases((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  }

  return (
    <div className="min-w-0">
      <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-xl">
                Generated Test Cases
              </h2>
              <Badge
                variant="secondary"
                className="h-fit w-fit shrink-0 font-normal tabular-nums"
              >
                {testCases.length} {testCases.length === 1 ? "case" : "cases"}
              </Badge>
              {selectedCount > 0 ? (
                <Badge
                  variant="outline"
                  className="h-fit w-fit shrink-0 font-normal tabular-nums"
                >
                  {selectedCount} selected
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review, select, and manage AI-suggested cases for this repository.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={!repoId}
            aria-label="Refresh test cases from server"
            onClick={() => void onRefresh(repoId)}
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
            Refresh
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <ul
          className="divide-y divide-border"
          aria-label="Generated test cases"
        >
          {testCases.map((tc) => {
            const isSelected = selectedTestCases.some((s) => s.id === tc.id);
            return (
              <li
                key={tc.id}
                className={cn(
                  "relative transition-colors hover:bg-muted/30",
                  isSelected && "bg-muted/25",
                )}
              >
                <TestcaseSettingsDialog
                  testCase={tc}
                  onUpdated={handleTestCaseUpdated}
                />

                <div className="flex gap-3 px-3 py-4 pr-11 sm:px-5 sm:py-5 sm:pr-14">
                  <Checkbox
                    className="mt-1 shrink-0"
                    aria-label={`Select test case: ${tc.title}`}
                    checked={isSelected}
                    onCheckedChange={(value) =>
                      toggleSelected(tc, value === true)
                    }
                  />

                  <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                      <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground lg:pr-4">
                        {tc.title}
                      </h3>
                      <div className="flex shrink-0 flex-wrap gap-1.5 lg:justify-end">
                        <Badge
                          variant="secondary"
                          className="font-normal capitalize shadow-none"
                        >
                          {tc.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-normal capitalize"
                        >
                          {tc.priority}
                        </Badge>
                        {tc.status ? (
                          <Badge
                            variant={
                              tc.status === "failed"
                                ? "destructive"
                                : tc.status === "running"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="font-normal"
                          >
                            {tc.status}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {tc.description}
                    </p>

                    {tc.targetRoute ? (
                      <div className="flex flex-col gap-1 border-l-2 border-primary/25 bg-muted/30 py-2 pl-3 pr-2 sm:flex-row sm:items-baseline sm:gap-3 sm:pl-4">
                        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <Route className="size-3.5 opacity-70" aria-hidden />
                          Route
                        </div>
                        <code className="break-all font-mono text-xs leading-relaxed text-foreground/90 sm:text-[0.8125rem]">
                          {tc.targetRoute}
                        </code>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={
          "mt-6 flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
        }
      >
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            Run selected test cases
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {selectedCount === 0
              ? "Choose cases above, then start a run against the selected items."
              : `${selectedCount} selected — run will use these cases only.`}
          </p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 gap-2 sm:w-auto"
          disabled={selectedCount === 0}
          onClick={() => {
            if (hasNoCredits(userDetails?.credits)) {
              toastPayBeforeRunning();
              return;
            }
            setRunDialogOpen(true);
          }}
        >
          <Play className="h-4 w-4" aria-hidden />
          Run
        </Button>
      </div>

      <TestExecutionModal
        isOpen={runDialogOpen}
        onClose={() => {
          setRunDialogOpen(false);
          void onRefresh(repoId);
        }}
        testCases={selectedTestCases}
        repository={repository}
      />
    </div>
  );
};

export default TestCaseList;
