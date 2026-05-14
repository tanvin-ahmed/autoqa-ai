import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { isClerkConfigured } from "@/lib/env/clerk";
import Provider from "./provider";

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
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );

  if (isClerkConfigured()) {
    return <ClerkProvider>{shell}</ClerkProvider>;
  }

  return shell;
}
