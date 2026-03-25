import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Docksmith — AI-Powered Code Review, Security Testing & Interaction Testing",
  description:
    "Deep code review, autonomous security pentesting, and UX interaction testing in a single platform. AI agents review your code, attack your app, and stress-test your UI — all inside cloud sandboxes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
