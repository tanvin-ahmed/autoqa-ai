"use client";

import React, { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Repository } from "@/db";
import { Settings2, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";

const repoSettingsFormSchema = z.object({
  targetDomain: z
    .string()
    .trim()
    .min(1, "App URL is required")
    .url("Enter a valid URL"),
  globalInstruction: z.string(),
});

export type RepoSettingsFormValues = z.infer<typeof repoSettingsFormSchema>;

function valuesFromRepo(repo: Repository): RepoSettingsFormValues {
  return {
    targetDomain: repo.targetDomain?.trim() || "",
    globalInstruction: repo.globalInstruction ?? "",
  };
}

type RepoSettingsDialogProps = {
  repo: Repository;
  userId?: number;
  onUpdated?: (repo: Repository) => void;
};

const RepoSettingsDialog = ({
  repo,
  userId,
  onUpdated,
}: RepoSettingsDialogProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<RepoSettingsFormValues>({
    resolver: zodResolver(repoSettingsFormSchema),
    defaultValues: valuesFromRepo(repo),
  });

  const { isSubmitting } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(valuesFromRepo(repo));
    }
  }

  const onSubmit = async (data: RepoSettingsFormValues) => {
    if (userId == null) {
      toast.error("You must be signed in to save settings");
      return;
    }

    try {
      const { data: updated } = await axios.put<Repository>(
        "/api/github/user-repo/settings",
        {
          id: repo.id,
          targetDomain: data.targetDomain.trim(),
          globalInstruction: data.globalInstruction.trim() || null,
        },
      );

      if (
        updated == null ||
        typeof updated !== "object" ||
        !("id" in updated)
      ) {
        toast.error("Update did not return a repository");
        return;
      }

      onUpdated?.(updated);
      setOpen(false);
      toast.success("Project settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project settings", {
        description: "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full shrink-0 gap-2 sm:w-auto"
        >
          <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
          Project config
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 shrink-0" aria-hidden />{" "}
            Project/Repository settings
          </DialogTitle>
          <DialogDescription>
            Configure project level defaults used during test case generation
            and execution.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="targetDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App url/default website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    The target address where automated browsers will connect and
                    run test cases.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="globalInstruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Global test instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write global test instructions here..."
                      rows={4}
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Include authentication notes, cookies, setup or teardown
                    instructions. These are appended to AI prompts.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => form.reset(valuesFromRepo(repo))}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {isSubmitting ? "Saving…" : "Save config"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RepoSettingsDialog;
