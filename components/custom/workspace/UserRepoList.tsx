import type { Repository } from "@/db";
import React from "react";
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
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import StatusCard from "./StatusCard";

const UserRepoList = ({ repoList }: { repoList: Repository[] }) => {
  return (
    <div>
      {repoList.map((repo) => {
        const totalTests = 0;
        const passedTests = 0;
        const failedTests = 0;
        const passRate =
          totalTests > 0
            ? Math.round((passedTests / totalTests) * 100)
            : 0;

        return (
          <Accordion
          key={repo.id}
          type="single"
          collapsible
          defaultValue={repo.id.toString()}
        >
          <AccordionItem value={repo.id.toString()}>
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
                    value={totalTests}
                    icon={
                      <ListChecks className="h-5 w-5 text-blue-600" />
                    }
                    bgColor="bg-blue-50"
                  />
                  <StatusCard
                    title="Passed"
                    value={passedTests}
                    icon={
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    }
                    bgColor="bg-green-50"
                  />
                  <StatusCard
                    title="Failed"
                    value={failedTests}
                    icon={<XCircle className="h-5 w-5 text-red-600" />}
                    bgColor="bg-red-50"
                  />
                  <StatusCard
                    title="Pass Rate"
                    value={`${passRate}%`}
                    icon={
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    }
                    bgColor="bg-purple-50"
                  />
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border bg-gray-50 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-medium">Generate AI Test Cases</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Analyze this repository and generate automated test cases
                      using AI.
                    </p>
                  </div>
                  <Button type="button" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Test Cases
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};

export default UserRepoList;
