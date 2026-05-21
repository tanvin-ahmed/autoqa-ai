import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AppShell } from "@/components/custom/AppShell";
import { ThemeProvider } from "@/providers/theme-provider";
import { isClerkConfigured } from "@/lib/env/clerk";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Auto QA — AI-assisted test automation",
    template: "%s · Auto QA",
  },
  description:
    "JavaScript & TypeScript (incl. MERN) repos only—connect GitHub, draft reviewable tests with AI, and run scenarios beside Vitest, Jest, Playwright, Cypress.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkAuthConfigured = isClerkConfigured();

  const shell = (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-dvh antialiased"
        style={{ margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <AppShell clerkAuthConfigured={clerkAuthConfigured}>
              {children}
            </AppShell>
          </Provider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );

  if (clerkAuthConfigured) {
    return <ClerkProvider>{shell}</ClerkProvider>;
  }

  return shell;
}
