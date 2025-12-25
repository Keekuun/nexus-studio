import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Studio",
  description: "多模态创作平台 - 集成文本、音视频和AI技术",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex flex-col min-h-screen">
        <PerformanceMonitor enabled={true} />
        <ErrorBoundary>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex flex-1">{children}</main>
          </div>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

