import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import Image from "next/image";
import React from "react";

const EmptyWorkspace = () => {
  return (
    <div className="flex flex-col items-center justify-center my-20">
      <Image src={"/folder.png"} alt="folder" width={100} height={100} />
      <h3 className="text-lg font-bold">No repositories added</h3>
      <p className="text-sm text-muted-foreground">
        Connect your github account & add a repository to generate and run test
        cases
      </p>
      <Button variant="default" className="mt-4">
        <Link className="h-4 w-4" /> Connect repo
      </Button>
    </div>
  );
};

export default EmptyWorkspace;
