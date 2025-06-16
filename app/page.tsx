import React from 'react';
import Link from 'next/link';

const stats = {
  dailyGoal: 60,
  callMinutes: 0,
  messagesToday: 0,
  teamCredits: 6,
  trainingChatsSent: 0,
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white px-4 md:px-12 py-8">
      <div className="mb-10">
        <div className="text-lg mb-4 font-semibold text-zinc-200">mr, today is Tuesday, June 10. <span className="text-purple-400">Complete quests, level up, dominate the leaderboard.</span></div>
        <div className="bg-zinc-900/80 rounded-2xl p-8 shadow-xl mb-6 border border-zinc-800 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-700/30 to-pink-600/10 rounded-full blur-2xl z-0" />
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 relative z-10">
            <div className="font-bold text-xl mb-2 md:mb-0">Daily Training Progress</div>
            <Link href="/billing">
              <button className="bg-zinc-800 px-5 py-2 rounded-lg text-white font-semibold hover:bg-purple-700/80 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500">+ Add Minutes</button>
            </Link>
          </div>
          <div className="text-4xl font-extrabold mb-1 tracking-tight text-white drop-shadow">{stats.callMinutes} minutes</div>
          <div className="text-zinc-400 mb-4">Last 24 hours</div>
          <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden mb-3 shadow-inner">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 transition-all duration-500" style={{ width: `${(stats.callMinutes / stats.dailyGoal) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Progress toward daily goal ({stats.dailyGoal} min)</span>
            <span>{stats.dailyGoal - stats.callMinutes} minutes remaining to reach your daily goal</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-extrabold mb-1 text-purple-400">{stats.dailyGoal} min</div>
            <div className="text-zinc-400 text-xs">Target training time per day</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-extrabold mb-1 text-blue-400">{stats.messagesToday}</div>
            <div className="text-zinc-400 text-xs">Training interactions</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-extrabold mb-1 text-green-400">{stats.teamCredits}</div>
            <div className="text-zinc-400 text-xs">Available training minutes</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 flex flex-col justify-between shadow-lg border border-zinc-800 hover:scale-[1.02] transition-transform duration-300">
            <div className="font-semibold mb-2 text-lg">Start Training Call</div>
            <div className="text-zinc-400 mb-6">Practice your sales skills with AI-powered voice training</div>
            <Link href="/sales-training">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg text-white font-bold hover:scale-105 hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">Start Training →</button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 flex flex-col justify-between shadow-lg border border-zinc-800 hover:scale-[1.02] transition-transform duration-300">
            <div className="font-semibold mb-2 text-lg">View Training History</div>
            <div className="text-zinc-400 mb-6">Review past sessions and track your improvement</div>
            <Link href="/call-review">
              <button className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-2 rounded-lg text-white font-bold hover:scale-105 hover:from-blue-600 hover:to-green-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500">View History →</button>
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-zinc-900/80 rounded-2xl p-8 shadow-xl border border-zinc-800">
        <div className="font-bold text-2xl mb-6 tracking-tight">Your 24 Hour Training Results</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[140px] shadow-md border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-5xl font-extrabold mb-2 text-white/90 drop-shadow">{stats.callMinutes} minutes</div>
            <div className="text-zinc-400 text-base">How many minutes you've spent with your training.</div>
          </div>
          <div className="bg-black/40 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[140px] shadow-md border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-5xl font-extrabold mb-2 text-purple-400 drop-shadow">{((stats.callMinutes / stats.dailyGoal) * 100).toFixed(0)}%</div>
            <div className="text-zinc-400 text-base">Training minutes goal for the day.</div>
          </div>
          <div className="bg-black/40 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[140px] shadow-md border border-zinc-800 hover:scale-105 transition-transform duration-300">
            <div className="text-5xl font-extrabold mb-2 text-blue-400 drop-shadow">{stats.trainingChatsSent}</div>
            <div className="text-zinc-400 text-base">How many messages you've sent to your AI sales trainers.</div>
          </div>
        </div>
      </div>
    </div>
  );
}