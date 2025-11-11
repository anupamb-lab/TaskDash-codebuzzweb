"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Login failed');
      }
      router.push('/team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="text-xs">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div>
          <label className="text-xs">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="flex items-center justify-between">
          <button className="rounded bg-blue-600 px-3 py-1 text-white">Sign in</button>
          <a href="/register" className="text-sm text-slate-600">Register</a>
        </div>
      </form>
    </div>
  );
}
