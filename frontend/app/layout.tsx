import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "AI Interview Partner | Practice Real-Time Technical & Behavioral Interviews",
  description:
    "AI-powered interview simulator featuring dual-stream video, resume analysis, and real-time voice feedback. Ace your next interview with personalized AI coaching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 flex flex-col antialiased">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}