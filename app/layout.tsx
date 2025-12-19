import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./globals.css";

// 性能监控
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  // 可以在这里集成性能监控服务
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });
}

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
        <ErrorBoundary>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 md:ml-64">{children}</main>
          </div>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}

