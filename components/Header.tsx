import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 pt-8 px-4 md:px-12">
      <div className="flex items-center gap-4">
        <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent drop-shadow">Sales Dashboard</div>
      </div>
      <nav className="flex gap-2 md:gap-6 text-sm font-medium text-zinc-400">
        <Link href="/" className="px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">Dashboard</Link>
        <Link href="/sales-training" className="px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">Sales Training</Link>
        <Link href="/call-review" className="px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">Call Review</Link>
        <Link href="/billing" className="px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">Billing</Link>
        <Link href="/my-teams" className="px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors">My Teams</Link>
      </nav>
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-pink-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-zinc-900">mr</div>
      </div>
    </header>
  );
} 