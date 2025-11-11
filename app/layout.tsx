import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Task Dash - Simple Task & Project Manager",
  description: "Simple task & project manager by codebuzzweb Developers."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <Header />
          <div className="flex min-h-screen">
          <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col p-4 gap-4">
            <div className="text-2xl font-bold tracking-tight">Monday Lite</div>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
              <span className="font-semibold uppercase text-xs text-slate-400">
                Navigation
              </span>
              <a href="/" className="px-3 py-2 rounded-lg hover:bg-slate-800">
                Dashboard
              </a>
            </nav>
          </aside>
          <main className="flex-1 bg-slate-100">
            <header className="md:hidden sticky top-0 z-10 bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">Monday Lite</span>
            </header>
            <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
          </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
