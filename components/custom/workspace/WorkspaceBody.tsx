"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserDetailsContext } from "@/context/userDetailsContext";
import Image from "next/image";
import React, { useCallback, useContext, useEffect, useState } from "react";
import EmptyWorkspace from "./EmptyWorkspace";
import axios from "axios";
import { useRouter } from "next/navigation";
import RepoDialog from "./RepoDialog";

const WorkspaceBody = () => {
  const { userDetails } = useContext(UserDetailsContext);
  const router = useRouter();
  const [githubToken, setGithubToken] = useState<string | null>(null);

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

  useEffect(() => {
    handleGetGithubToken();
  }, [handleGetGithubToken]);

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
          <RepoDialog />
        )}
      </Card>

      <Card>
        <CardContent>
          <EmptyWorkspace />
        </CardContent>
      </Card>
    </section>
  );
};

export default WorkspaceBody;
