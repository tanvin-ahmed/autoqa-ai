import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { isClerkConfigured } from "@/lib/env/clerk";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Next.js Premium Startup Boilerplate",
  description:
    "Created using the ultimate interactive Next.js stack generator CLI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <Provider>{children}</Provider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );

  if (isClerkConfigured()) {
    return <ClerkProvider>{shell}</ClerkProvider>;
  }

  return shell;
}
