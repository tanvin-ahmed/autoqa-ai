"use client";

import { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TestCase } from "@/db";
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  ExternalLink,
  Globe,
  Code,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { UserDetailsContext } from "@/context/userDetailsContext";
import {
  hasNoCredits,
  isInsufficientCreditsAxiosResponse,
  toastPayBeforeRunning,
} from "@/lib/insufficient-credits-toast";
import { toastGitHubRequiredForWorkspace } from "@/lib/workspace-toasts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  repository: any; // Connected repository config
  githubConnected: boolean;
};

type RunResult = {
  testCaseId: number;
  status: "idle" | "generating" | "running" | "passed" | "failed";
  logs: string[];
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  browserbaseScript?: string;
};

export default function TestExecutionModal({
  isOpen,
  onClose,
  testCases,
  repository,
  githubConnected,
}: Props) {
  const { userDetails, setUserDetails } = useContext(UserDetailsContext);
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  // Advanced Options states
  const [executionMode, setExecutionMode] = useState<"cache" | "generate">(
    "cache",
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  // Initialize states when testCases change or modal opens
  useEffect(() => {
    if (isOpen && testCases.length > 0) {
      const initial: Record<number, RunResult> = {};
      testCases.forEach((tc) => {
        const tcStatus = (tc as any).status;
        const tcLogs = (tc as any).logs;
        const hasPreviousLogs = Array.isArray(tcLogs) && tcLogs.length > 0;

        initial[tc.id] = {
          testCaseId: tc.id,
          status:
            tcStatus === "passed" || tcStatus === "failed" ? tcStatus : "idle",
          logs: hasPreviousLogs ? tcLogs : ["Waiting to run..."],
          browserbaseScript: tc.browserbaseScript || undefined,
          sessionId:
            (tc as any).sessionId || (tc as any).session_id || undefined,
          sessionUrl:
            (tc as any).sessionUrl || (tc as any).session_url || undefined,
        };
      });
      setResults(initial);
      setSelectedDetailId(testCases[0].id);
      setCurrentIdx(-1);
      setIsExecuting(false);
      setCustomPrompt("");

      // Prefill with repository's saved website URL if available
      setBaseUrl(
        repository?.targetDomain ||
          repository?.websiteUrl ||
          "http://localhost:3000",
      );

      // Auto-detect if any selected testcase doesn't have a cached script.
      // If even one doesn't have a script, default to "generate" mode.
      const hasMissingScript = testCases.some((tc) => !tc.browserbaseScript);
      setExecutionMode(hasMissingScript ? "generate" : "cache");
    }
  }, [isOpen, testCases, repository]);

  // Handle executing the queue sequentially
  useEffect(() => {
    if (!isExecuting || currentIdx < 0 || currentIdx >= testCases.length) {
      if (currentIdx >= testCases.length) {
        setIsExecuting(false);
      }
      return;
    }

    const runTest = async () => {
      const currentTestCase = testCases[currentIdx];
      const tcId = currentTestCase.id;

      setSelectedDetailId(tcId);

      const isRegenerating =
        executionMode === "generate" || !results[tcId]?.browserbaseScript;

      setResults((prev) => ({
        ...prev,
        [tcId]: {
          ...prev[tcId],
          status: isRegenerating ? "generating" : "running",
          logs: [
            isRegenerating
              ? "[SYSTEM] Connecting to AI agent to analyze files and generate script..."
              : "[SYSTEM] Found pre-generated script cached in database, preparing execution...",
          ],
        },
      }));

      try {
        // Call run API with advanced flags
        const res = await axios.post("/api/test-cases/run", {
          testCaseId: tcId,
          baseUrl: baseUrl.trim(),
          mode: executionMode, // "cache" (direct run) or "generate" (regenerate)
          customPrompt: customPrompt.trim(),
        });

        const data = res.data;

        if (typeof data.creditsRemaining === "number") {
          setUserDetails((prev) =>
            prev ? { ...prev, credits: data.creditsRemaining! } : prev,
          );
        }

        setResults((prev) => ({
          ...prev,
          [tcId]: {
            testCaseId: tcId,
            status: data.status,
            logs: data.logs || [],
            browserbaseScript: data.browserbaseScript,
            sessionId: data.sessionId,
            sessionUrl: data.sessionUrl,
            error: data.error,
          },
        }));
      } catch (err: unknown) {
        const rem = axios.isAxiosError(err)
          ? err.response?.data?.creditsRemaining
          : undefined;
        if (typeof rem === "number") {
          setUserDetails((prev) => (prev ? { ...prev, credits: rem } : prev));
        }
        if (isInsufficientCreditsAxiosResponse(err)) {
          toastPayBeforeRunning();
        }
        const errMsg = axios.isAxiosError(err)
          ? err.response?.data?.error ?? err.message
          : err instanceof Error
            ? err.message
            : "Execution failed";
        const message =
          typeof errMsg === "string" ? errMsg : "Execution failed";
        setResults((prev) => ({
          ...prev,
          [tcId]: {
            ...prev[tcId],
            status: "failed",
            error: errMsg,
            logs: [...(prev[tcId]?.logs || []), `[SYSTEM ERROR] ${errMsg}`],
          },
        }));
      }

      // Move to next item in the queue
      setCurrentIdx((prev) => prev + 1);
    };

    runTest();
  }, [isExecuting, currentIdx, testCases, baseUrl, executionMode, customPrompt]);

  const startExecution = () => {
    if (!githubConnected) {
      toastGitHubRequiredForWorkspace();
      return;
    }
    if (hasNoCredits(userDetails?.credits)) {
      toastPayBeforeRunning();
      return;
    }

    // Reset all statuses
    const resetResults: Record<number, RunResult> = {};
    testCases.forEach((tc) => {
      resetResults[tc.id] = {
        testCaseId: tc.id,
        status: "idle",
        logs: ["Queued..."],
        browserbaseScript: tc.browserbaseScript || undefined,
      };
    });
    setResults(resetResults);
    setIsExecuting(true);
    setCurrentIdx(0);
    setSelectedDetailId(testCases[0].id);
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setCurrentIdx(-1);
  };

  const currentSelectedResult = selectedDetailId
    ? results[selectedDetailId]
    : null;
  const currentSelectedTestCase = testCases.find(
    (tc) => tc.id === selectedDetailId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-4 overflow-hidden rounded-2xl bg-background p-6 shadow-2xl select-none sm:rounded-2xl">
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <PlayCircle className="h-6 w-6 text-primary" />
              Hosted browser test runner
            </DialogTitle>
            <DialogDescription className="text-sm">
              Runs Playwright scripts in the cloud on Browserless (CDP), with
              optional AI script generation via Gemini.
            </DialogDescription>
          </div>
        </DialogHeader>

        {!githubConnected ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground"
          >
            <p className="font-medium text-destructive">GitHub not connected</p>
            <p className="mt-1 text-muted-foreground">
              Connect GitHub in the workspace header, refresh if needed, then
              reopen this dialog to run tests.
            </p>
          </div>
        ) : null}

        {/* Target Configuration Header */}
        <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" /> Target Website
                URL
              </label>
              <Input
                placeholder="e.g. http://localhost:3000"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                disabled={isExecuting}
                className="h-10 bg-background font-mono text-sm text-foreground shadow-xs placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptions(!showOptions)}
                className={`h-10 gap-1.5 px-4 text-xs font-medium transition-colors ${showOptions ? "border-primary/40 bg-primary/10 text-primary" : "border-border"}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Execution Options
                {showOptions ? (
                  <ChevronUp className="h-3 w-3 ml-0.5" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                )}
              </Button>
              {!isExecuting ? (
                <Button
                  onClick={startExecution}
                  disabled={!githubConnected}
                  className="h-10 bg-primary px-6 font-medium text-primary-foreground shadow-md hover:bg-primary/95 gap-2"
                >
                  <Play className="h-4 w-4 fill-primary-foreground" /> Start
                  Execution
                </Button>
              ) : (
                <Button
                  onClick={stopExecution}
                  variant="destructive"
                  className="h-10 px-6 font-medium gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" /> Stop Runner
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Advanced Options Section */}
          {showOptions && (
            <div className="grid animate-in fade-in slide-in-from-top-2 grid-cols-1 gap-5 border-t border-border pt-3 duration-200 md:grid-cols-3">
              {/* Execution Mode Segment */}
              <div className="space-y-1.5 md:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Run Mode
                </span>
                <div className="grid grid-cols-2 gap-px rounded-lg border border-border bg-border p-1">
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("cache")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      executionMode === "cache"
                        ? "bg-background text-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    } disabled:opacity-50`}
                  >
                    <Database className="h-3.5 w-3.5" /> Run Cached
                  </button>
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("generate")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      executionMode === "generate"
                        ? "bg-background text-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    } disabled:opacity-50`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />{" "}
                    AI Regenerate
                  </button>
                </div>
              </div>

              {/* Temporary Prompt/Instruction Override Textarea */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Run Instructions (Merged with Global Settings)
                </span>
                <textarea
                  placeholder="e.g. Make sure to click the profile dropdown before asserting, or wait 1s after clicks..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isExecuting || executionMode === "cache"}
                  rows={2}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-sans text-xs text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:bg-muted disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Dashboard Panel */}
        <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden md:grid-cols-3">
          {/* Left: Test Cases Queue List */}
          <div className="flex flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 shadow-xs md:col-span-1">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Execution Queue
            </h3>
            {testCases.map((tc, index) => {
              const res = results[tc.id];
              const isActive = selectedDetailId === tc.id;
              const isRunning = currentIdx === index && isExecuting;

              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedDetailId(tc.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    isActive
                      ? "border-primary bg-card shadow-sm ring-1 ring-primary/30"
                      : "border-border bg-card/70 shadow-xs hover:border-primary/40"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
                      {tc.title}
                    </h4>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? "rotate-90 text-primary" : ""}`}
                    />
                  </div>
                  <p className="mb-2.5 line-clamp-1 text-xs text-muted-foreground">
                    {tc.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono capitalize"
                    >
                      {tc.type}
                    </Badge>
                    <StatusBadge
                      status={res?.status || "idle"}
                      isRunning={isRunning}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Code, Live Logs & Details Panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:col-span-2">
            {currentSelectedTestCase ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header Info */}
                <div className="flex shrink-0 flex-col gap-4 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">
                      {currentSelectedTestCase.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Expected: {currentSelectedTestCase.expectedResult}
                    </p>
                  </div>
                  {currentSelectedResult?.sessionUrl && (
                    <Button
                      onClick={() =>
                        window.open(currentSelectedResult.sessionUrl, "_blank")
                      }
                      variant="outline"
                      size="sm"
                      className="font-medium text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5 shadow-xs shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                      dashboard link
                    </Button>
                  )}
                </div>

                {/* Body split: Code Accordion + Terminal */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                  {/* Playwright Script Code Block */}
                  {currentSelectedResult?.browserbaseScript && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <div className="flex items-center justify-between border-b border-border bg-muted px-3.5 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Code className="h-3.5 w-3.5 text-primary" />{" "}
                          Generated Playwright Code
                        </span>
                      </div>
                      <pre className="max-h-36 overflow-x-auto border-t border-border bg-muted/70 p-3 font-mono text-[11px] leading-relaxed text-emerald-800 dark:bg-muted/25 dark:text-emerald-400">
                        {currentSelectedResult.browserbaseScript}
                      </pre>
                    </div>
                  )}

                  {/* Terminal logs panel */}
                  <div className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                    <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted px-3.5 py-2.5 font-mono">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Terminal className="h-3.5 w-3.5" /> Console Terminal
                        Output
                      </span>
                      <Badge
                        variant="secondary"
                        className="border-0 bg-background/70 font-mono text-[10px] uppercase text-muted-foreground dark:bg-background/60"
                      >
                        {currentSelectedResult?.status || "idle"}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground select-text dark:bg-muted/25">
                      {currentSelectedResult?.logs.map((log, lIdx) => (
                        <div
                          key={lIdx}
                          className="leading-relaxed whitespace-pre-wrap"
                        >
                          {log.startsWith("[SYSTEM]") ? (
                            <span className="text-blue-700 dark:text-blue-400">
                              {log}
                            </span>
                          ) : log.startsWith("[SYSTEM ERROR]") ? (
                            <span className="font-semibold text-rose-700 dark:text-rose-400">
                              {log}
                            </span>
                          ) : log.startsWith("[BROWSER]") ? (
                            <span className="text-purple-700 dark:text-purple-400">
                              {log}
                            </span>
                          ) : (
                            <span className="text-foreground">{log}</span>
                          )}
                        </div>
                      ))}
                      {currentSelectedResult?.error && (
                        <div className="mt-2 border-t border-border pt-2 font-bold text-destructive">
                          Error: {currentSelectedResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Terminal className="mb-3 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-bold text-foreground">
                  No Test Case Selected
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Choose any test case from the queue to inspect its console
                  logs and code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExecuting}
            className="h-10 font-medium px-5"
          >
            Close & Refresh Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({
  status,
  isRunning,
}: {
  status: RunResult["status"];
  isRunning: boolean;
}) {
  if (isRunning) {
    return (
      <Badge className="flex animate-pulse items-center gap-1 border border-amber-500/35 bg-amber-500/15 text-amber-950 hover:bg-amber-500/15 dark:text-amber-100">
        <Loader2 className="h-3 w-3 animate-spin" /> Running
      </Badge>
    );
  }

  switch (status) {
    case "generating":
      return (
        <Badge className="flex items-center gap-1 border border-sky-500/35 bg-sky-500/15 text-sky-950 hover:bg-sky-500/15 dark:text-sky-100">
          <Loader2 className="h-3 w-3 animate-spin" /> Generating...
        </Badge>
      );
    case "passed":
      return (
        <Badge className="flex items-center gap-1 border border-emerald-500/35 bg-emerald-500/15 text-emerald-950 hover:bg-emerald-500/15 dark:text-emerald-100">
          <CheckCircle2 className="h-3 w-3" /> Passed
        </Badge>
      );
    case "failed":
      return (
        <Badge className="flex items-center gap-1 border border-rose-500/35 bg-rose-500/15 text-rose-950 hover:bg-rose-500/15 dark:text-rose-100">
          <XCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    case "idle":
    default:
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Queued
        </Badge>
      );
  }
}
