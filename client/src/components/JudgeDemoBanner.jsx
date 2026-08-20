import React from 'react';
import { Sparkles, CheckCircle, AlertCircle, AlertOctagon, ArrowRight } from 'lucide-react';

export default function JudgeDemoBanner({ onSelectTrade, trades }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 border border-cyan-500/30 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hackathon Judge Quick-Start Showcase (BOT Chain Mainnet 677)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Interactive Test Cases
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Click any scenario to test the live AI Oracle verification and onchain settlement flow
          </span>
        </div>

        {/* 3 Quick-Action Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Case 1: Cocoa (Release Funds) */}
          <button
            onClick={() => {
              const trade = trades.find((t) => t.commodity?.toLowerCase().includes('cocoa'));
              if (trade) onSelectTrade(trade);
            }}
            className="flex flex-col text-left p-4 rounded-xl bg-tradelock-surface hover:bg-tradelock-card border border-emerald-500/30 hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                CASE 1: CLEAN DELIVERY
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">96% Match</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              10 MT Organic Cocoa Beans ($18,000)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Valid B/L, SGS Lab Cert moisture 6.8%, container seals match across all manifests.
            </p>
            <div className="mt-3 pt-2 border-t border-tradelock-border flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>AI: RELEASE_FUNDS</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Case 2: Coffee (Request Review) */}
          <button
            onClick={() => {
              const trade = trades.find((t) => t.commodity?.toLowerCase().includes('coffee'));
              if (trade) onSelectTrade(trade);
            }}
            className="flex flex-col text-left p-4 rounded-xl bg-tradelock-surface hover:bg-tradelock-card border border-amber-500/30 hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                CASE 2: MINOR VARIANCE
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">76% Match</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              20 MT Robusta Coffee ($24,000)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              3-day shipping channel delay & moisture 12.8% vs 12.5% max target.
            </p>
            <div className="mt-3 pt-2 border-t border-tradelock-border flex items-center justify-between text-[11px] text-amber-400 font-semibold">
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>AI: REQUEST_REVIEW</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Case 3: Copper (Flag Dispute) */}
          <button
            onClick={() => {
              const trade = trades.find((t) => t.commodity?.toLowerCase().includes('copper'));
              if (trade) onSelectTrade(trade);
            }}
            className="flex flex-col text-left p-4 rounded-xl bg-tradelock-surface hover:bg-tradelock-card border border-rose-500/30 hover:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                CASE 3: FORGERY & SHORTFALL
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">28% Match</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
              50 MT Copper Cathodes ($45,000)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              8.5 MT weight deficit (17% missing cargo), forged B/L seal, mismatched container.
            </p>
            <div className="mt-3 pt-2 border-t border-tradelock-border flex items-center justify-between text-[11px] text-rose-400 font-semibold">
              <div className="flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>AI: FLAG_DISPUTE</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
