// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PrivyWrapper } from "./components/PrivyWrapper"; // Import the PrivyWrapper
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Banshee Livestream",
  description: "Livestreamed Performance Powered by Livepeer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyWrapper>
          {children} {/* All children will now be inside PrivyWrapper */}
        </PrivyWrapper>
      </body>
    </html>
  );
}
