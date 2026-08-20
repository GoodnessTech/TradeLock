import React, { useState, useEffect } from 'react';
import { Radio, ExternalLink, ShieldCheck, Zap, Server, Activity } from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../contracts/config';

export default function NetworkBanner({ blockNumber, latency }) {
  return (
    <div className="border-b border-cyan-950/60 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-cyan-950/30 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Network & Chain ID indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">
              {BOT_CHAIN_CONFIG.chainName}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-mono text-[11px]">
              Chain ID: {BOT_CHAIN_CONFIG.chainId} (0x2a5)
            </span>
          </div>

          <span className="hidden sm:inline text-slate-600">•</span>

          <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px]">{BOT_CHAIN_CONFIG.rpcUrl}</span>
          </div>
        </div>

        {/* Live Block, Protocol Fee, & Explorer link */}
        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Block:</span>
            <span className="font-mono text-slate-200 font-medium">{blockNumber || 'Syncing...'}</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protocol Fee: <span className="font-mono font-semibold">1.0%</span></span>
          </div>

          <a
            href={BOT_CHAIN_CONFIG.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
