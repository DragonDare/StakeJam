import type { Metadata } from "next";
import "./globals.css";
import ClientRoot from "./client-root";

export const metadata: Metadata = {
  title: "StakeJam",
  description: "Stake to surface talent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
