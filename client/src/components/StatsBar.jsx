import React from 'react';
import { Shield, TrendingUp, Cpu, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';

export default function StatsBar({ trades }) {
  const totalVolume = trades.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const activeCount = trades.filter((t) => t.status !== 'RELEASED' && t.status !== 'REFUNDED').length;
  const verifiedCount = trades.filter((t) => t.status === 'AI_VERIFIED' || t.status === 'RELEASED').length;
  const fraudPrevented = trades.filter((t) => t.aiReport?.recommendation === 'FLAG_DISPUTE' || t.status === 'DISPUTED').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Stat 1: Total Escrow Volume */}
      <div className="glass-card rounded-2xl p-5 border border-tradelock-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Escrow Volume</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            {totalVolume.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-cyan-400 font-mono">BOT</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
          <span className="text-emerald-400 font-semibold">100% Onchain</span>
          <span>• BOT Chain Mainnet</span>
        </div>
      </div>

      {/* Stat 2: Active RWA Contracts */}
      <div className="glass-card rounded-2xl p-5 border border-tradelock-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Escrow Contracts</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            {activeCount}
          </span>
          <span className="text-xs text-slate-400">Active Deals</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
          <span className="text-emerald-400 font-semibold">{verifiedCount} AI Verified</span>
          <span>• 0.5% - 2.0% Fee</span>
        </div>
      </div>

      {/* Stat 3: AI Oracle Performance */}
      <div className="glass-card rounded-2xl p-5 border border-tradelock-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Oracle Engine</span>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            99.4%
          </span>
          <span className="text-xs text-purple-400 font-semibold">Precision</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          <span>Avg Latency: </span>
          <span className="text-purple-300 font-mono font-medium">~3.2s</span>
          <span> • ECDSA Signed</span>
        </div>
      </div>

      {/* Stat 4: Trade Protection & Anomalies */}
      <div className="glass-card rounded-2xl p-5 border border-tradelock-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fraud Prevention</span>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            {fraudPrevented}
          </span>
          <span className="text-xs text-amber-400 font-semibold">Tamper Flags</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          <span className="text-amber-400 font-semibold">Protected Escrow</span>
          <span> • Zero Blind Trust</span>
        </div>
      </div>

    </div>
  );
}
