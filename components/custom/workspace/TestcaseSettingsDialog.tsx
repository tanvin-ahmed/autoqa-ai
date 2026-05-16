"use client";

import type { TestCase } from "@/db";
import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";

const settingsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  targetRoute: z.string().optional(),
  expectedResult: z.string().optional(),
});

export type TestcaseSettingsFormValues = z.infer<typeof settingsSchema>;

function valuesFromTestCase(testCase?: TestCase): TestcaseSettingsFormValues {
  return {
    title: testCase?.title ?? "",
    description: testCase?.description ?? "",
    targetRoute: testCase?.targetRoute ?? "",
    expectedResult: testCase?.expectedResult ?? "",
  };
}

type TestcaseSettingsDialogProps = {
  testCase?: TestCase;
  onUpdated?: (updated: TestCase) => void;
};

const TestcaseSettingsDialog = ({
  testCase,
  onUpdated,
}: TestcaseSettingsDialogProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<TestcaseSettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: valuesFromTestCase(testCase),
  });

  const { isSubmitting } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(valuesFromTestCase(testCase));
    }
  }

  const onSubmit = async (data: TestcaseSettingsFormValues) => {
    if (testCase?.id == null) {
      toast.error("Missing test case");
      return;
    }
    try {
      const { data: updated } = await axios.put<TestCase>(
        `/api/test-cases/settings`,
        {
          id: testCase.id,
          title: data.title,
          description: data.description,
          targetRoute: data.targetRoute,
          expectedResult: data.expectedResult,
        },
      );
      if (updated == null || typeof updated !== "object" || !("id" in updated)) {
        toast.error("Update did not return a test case");
        return;
      }
      onUpdated?.(updated);
      setOpen(false);
      toast.success("Test case settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update test case settings", {
        description: "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-3 z-10 h-9 w-9 text-muted-foreground sm:right-3 sm:top-4"
          aria-label="Test case settings"
        >
          <SettingsIcon className="h-4 w-4" aria-hidden />
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
          <DialogTitle>Edit testing requirements</DialogTitle>
          <DialogDescription>
            Requirements automatically clear pregenerated scripts to ensure
            synchronization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter test title"
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test description / action</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write test description here..."
                      rows={4}
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetRoute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target route / path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/dashboard, /api/users, ..."
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedResult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected result</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write expected result here..."
                      rows={4}
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
                  onClick={() => form.reset(valuesFromTestCase(testCase))}
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
                {isSubmitting ? "Saving…" : "Update & save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TestcaseSettingsDialog;
