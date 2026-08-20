import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  PlusCircle, 
  FileSearch, 
  Layers, 
  Radio, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../contracts/config';

export default function Header({ 
  account, 
  chainId, 
  botBalance, 
  isConnecting, 
  connectWallet, 
  switchNetwork, 
  openCreateModal, 
  openScannerModal,
  activeRole,
  setActiveRole
}) {
  const isCorrectNetwork = chainId === BOT_CHAIN_CONFIG.chainId;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-tradelock-border/80 bg-tradelock-bg/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent border border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <Lock className="w-6 h-6 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  TRADE<span className="text-cyan-400">LOCK</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md badge-cyan">
                  AI × RWA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Trade without blind trust • <span className="text-cyan-300">BOT Chain Mainnet</span>
              </p>
            </div>
          </div>

          {/* Role Switcher (Buyer / Supplier / Oracle View) */}
          <div className="hidden md:flex items-center p-1 bg-tradelock-surface/90 border border-tradelock-border rounded-xl">
            <button
              onClick={() => setActiveRole('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setActiveRole('BUYER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'BUYER'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => setActiveRole('SUPPLIER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'SUPPLIER'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Supplier View
            </button>
            <button
              onClick={() => setActiveRole('ORACLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'ORACLE'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Oracle View
            </button>
          </div>

          {/* Action Buttons & Web3 Connect */}
          <div className="flex items-center space-x-3">
            
            {/* Custom AI Scanner Tool */}
            <button
              onClick={openScannerModal}
              className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-tradelock-surface hover:bg-tradelock-card border border-tradelock-border hover:border-cyan-500/50 rounded-xl transition-all shadow-sm"
              title="Test custom PO and delivery documents live"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Evidence Scanner</span>
            </button>

            {/* Create Purchase Order */}
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Escrow</span>
            </button>

            {/* Wallet Button */}
            {account ? (
              <div className="flex items-center space-x-2">
                {!isCorrectNetwork ? (
                  <button
                    onClick={switchNetwork}
                    className="px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-500/50 rounded-xl animate-pulse"
                  >
                    Switch to BOT Chain 677
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-tradelock-surface border border-tradelock-border rounded-xl">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <div className="text-left">
                      <div className="text-[11px] font-mono font-semibold text-slate-200">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </div>
                      <div className="text-[9px] text-cyan-400 font-mono">
                        {botBalance ? `${parseFloat(botBalance).toFixed(3)} BOT` : 'Chain 677'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 text-xs font-semibold text-slate-100 bg-tradelock-surface hover:bg-tradelock-card border border-tradelock-border hover:border-cyan-500/40 rounded-xl transition-all"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
