"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user, loading, refresh } = useAuth();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    refresh();
    // reload to reset client state
    window.location.href = "/login";
  }

  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            TaskDash
          </Link>
          {!loading && user && (
            <nav className="flex items-center gap-4">
              <Link href="/team" className="text-sm text-slate-600 hover:text-slate-900">
                Assigned to Me
              </Link>
            </nav>
          )}
        </div>

        <div>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm">
                {user.name || user.email} 
                <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                  {(user as any)?.role || 'Team member'}
                </span>
              </div>
              <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600">Sign in</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
