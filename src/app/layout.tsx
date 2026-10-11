import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotelPulse AI",
  description: "Hotel performance intelligence for owners, GMs, finance, revenue and F&B teams. Benchmarking, KPI analytics, AI insights, and monthly report generation.",
  openGraph: {
    title: "HotelPulse AI",
    description: "Hotel performance intelligence for owners, GMs, finance, revenue and F&B teams. Benchmarking, KPI analytics, AI insights, and monthly report generation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
