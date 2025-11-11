"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Register failed');
      }
      router.push('/team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="text-xs">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div>
          <label className="text-xs">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div>
          <label className="text-xs">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-2 py-1" />
        </div>
        <div className="flex items-center justify-between">
          <button className="rounded bg-blue-600 px-3 py-1 text-white">Register</button>
          <a href="/login" className="text-sm text-slate-600">Sign in</a>
        </div>
      </form>
    </div>
  );
}
