import React from 'react';
import { 
  Lock, 
  Cpu, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon,
  FileText,
  Sparkles
} from 'lucide-react';
import { ORDER_STATUS } from '../contracts/config';

export default function TradeCard({ trade, onSelect }) {
  const statusInfo = ORDER_STATUS[
    trade.status === 'FUNDED' ? 2 :
    trade.status === 'EVIDENCE_SUBMITTED' ? 3 :
    trade.status === 'AI_VERIFIED' ? 4 :
    trade.status === 'RELEASED' ? 5 :
    trade.status === 'REFUNDED' ? 6 :
    trade.status === 'DISPUTED' ? 7 : 1
  ] || ORDER_STATUS[2];

  const aiReport = trade.aiReport || trade.aiReview;
  const confidence = aiReport
    ? Math.round(aiReport.overallScore ?? aiReport.confidence ?? (aiReport.confidenceScore ? aiReport.confidenceScore / 100 : 90))
    : null;

  return (
    <div 
      onClick={() => onSelect(trade)}
      className="glass-card rounded-2xl p-5 border border-tradelock-border hover:border-cyan-500/50 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Demo Badge if applicable */}
      {trade.isDemo && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/10 rotate-45 pointer-events-none flex items-end justify-center pb-1">
          <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest font-mono">DEMO</span>
        </div>
      )}

      <div>
        {/* Top bar: Category + Demo tag + Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {trade.category || 'Commodities'}
            </span>
            {trade.isDemo && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                SIMULATED RWA
              </span>
            )}
          </div>
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${statusInfo.badgeClass}`}>
            {trade.status || 'FUNDED'}
          </span>
        </div>

        {/* Title & Amount */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
            {trade.title}
          </h3>
        </div>

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-xl font-black text-cyan-400 font-mono">
            {parseFloat(trade.amount || 0).toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-300 font-mono">{trade.currency || 'BOT'}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-medium">
            {trade.expectedQuantity} {trade.quantityUnit || trade.unit || 'MT'}
          </span>
        </div>

        {/* Trade Route & Ports */}
        <div className="mt-4 p-2.5 rounded-xl bg-tradelock-surface/70 border border-tradelock-border/60 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{trade.originPort}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 mx-1" />
            <span className="truncate font-medium text-white">{trade.destinationPort}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Incoterm: <span className="text-slate-200">{trade.incoterm}</span></span>
            <span>Deadline: <span className="text-slate-200">{new Date(trade.deliveryDeadline).toLocaleDateString()}</span></span>
          </div>
        </div>

        {/* Counterparties */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="truncate">
            <span className="text-slate-500 block">Buyer:</span>
            <span className="text-slate-300 truncate block font-medium">{trade.buyerName}</span>
          </div>
          <div className="truncate">
            <span className="text-slate-500 block">Supplier:</span>
            <span className="text-slate-300 truncate block font-medium">{trade.supplierName}</span>
          </div>
        </div>
      </div>

      {/* Footer: AI Verification telemetry or status */}
      <div className="mt-4 pt-3 border-t border-tradelock-border/80 flex items-center justify-between text-xs">
        {aiReport ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-cyan-300">
                {confidence}%
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              aiReport.recommendation === 'RELEASE_FUNDS'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : aiReport.recommendation === 'REQUEST_REVIEW'
                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
            }`}>
              {aiReport.recommendation}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{trade.evidence ? 'Evidence Ready' : 'Awaiting Cargo Documents'}</span>
          </div>
        )}

        <button className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center space-x-1">
          <span>Inspect</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
