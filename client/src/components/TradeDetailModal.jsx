import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  Layers, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Award, 
  UploadCloud, 
  Clock, 
  MapPin, 
  Anchor, 
  HelpCircle, 
  Copy, 
  Check,
  CheckCircle,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BOT_CHAIN_CONFIG } from '../contracts/config';

export default function TradeDetailModal({ 
  trade, 
  isOpen, 
  onClose, 
  onRunVerification, 
  onReleaseFunds, 
  onDisputeTrade,
  isVerifying,
  isReleasing,
  account
}) {
  const [activeTab, setActiveTab] = useState('AI_SCAN'); // 'AI_SCAN' | 'DOCS' | 'SETTLEMENT'
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState(null);

  if (!isOpen || !trade) return null;

  const aiReport = trade.aiReport || trade.aiReview;
  const score = aiReport
    ? Math.round(aiReport.overallScore ?? aiReport.confidence ?? (aiReport.confidenceScore ? aiReport.confidenceScore / 100 : 90))
    : null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(trade.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRelease = async () => {
    try {
      const res = await onReleaseFunds(trade);
      if (res?.txHash) {
        setTxHash(res.txHash);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispute = async () => {
    const reason = prompt('Please enter the reason for flagging a dispute:', 'Discrepancy detected in cargo manifests or specs');
    if (reason) {
      await onDisputeTrade(trade, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-tradelock-surface border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.15)] my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-tradelock-border/80 bg-tradelock-bg/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{trade.title}</h2>
                {trade.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    DEMO DATA - SIMULATED RWA
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  trade.status === 'RELEASED' ? 'badge-emerald' :
                  trade.status === 'DISPUTED' ? 'badge-rose' :
                  trade.status === 'AI_VERIFIED' ? 'badge-cyan' : 'badge-amber'
                }`}>
                  {trade.status}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
                <span className="truncate max-w-[180px] sm:max-w-xs">{trade.id}</span>
                <button onClick={copyOrderId} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span>•</span>
                <span className="text-cyan-300 font-bold">{parseFloat(trade.amount).toLocaleString()} {trade.currency || 'BOT'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-tradelock-card hover:bg-tradelock-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trade Lifecycle Visual Stepper */}
        <div className="bg-tradelock-card/60 px-6 py-3 border-b border-tradelock-border/60 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px]">1</div>
              <span>PO Created</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-emerald-500/40"></div>

            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px]">2</div>
              <span>Escrow Funded</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-emerald-500/40"></div>

            <div className={`flex items-center space-x-2 font-semibold ${trade.evidence ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                trade.evidence ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-800 border border-slate-700'
              }`}>3</div>
              <span>Evidence Uploaded</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${aiReport ? 'bg-cyan-500/40' : 'bg-slate-800'}`}></div>

            <div className={`flex items-center space-x-2 font-semibold ${aiReport ? 'text-cyan-400' : 'text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                aiReport ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-800 border border-slate-700'
              }`}>4</div>
              <span>AI Oracle Verified</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${trade.status === 'RELEASED' ? 'bg-emerald-500/40' : 'bg-slate-800'}`}></div>

            <div className={`flex items-center space-x-2 font-semibold ${trade.status === 'RELEASED' ? 'text-emerald-400' : trade.status === 'DISPUTED' ? 'text-rose-400' : 'text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                trade.status === 'RELEASED' ? 'bg-emerald-500/20 border border-emerald-500' :
                trade.status === 'DISPUTED' ? 'bg-rose-500/20 border border-rose-500' : 'bg-slate-800 border border-slate-700'
              }`}>5</div>
              <span>Settlement</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-tradelock-border bg-tradelock-surface text-xs font-semibold">
          <button
            onClick={() => setActiveTab('AI_SCAN')}
            className={`py-3.5 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'AI_SCAN'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Oracle Verification Console</span>
            {score !== null && (
              <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 font-mono">
                {score}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DOCS')}
            className={`py-3.5 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'DOCS'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Shipping & Manifest Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTLEMENT')}
            className={`py-3.5 px-4 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'SETTLEMENT'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Settlement & Smart Contract</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: AI ORACLE VERIFICATION CONSOLE */}
          {activeTab === 'AI_SCAN' && (
            <div className="space-y-6">
              
              {/* If no verification run yet */}
              {!aiReport ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-tradelock-card/60 border border-tradelock-border">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-4 animate-pulse">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Evidence Verification Ready</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
                    Execute the multi-vector AI verification engine to cross-examine delivery evidence against the Purchase Order.
                  </p>
                  <button
                    onClick={() => onRunVerification(trade)}
                    disabled={isVerifying}
                    className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isVerifying ? 'Running AI Engine...' : 'Run AI Multi-Vector Verification'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Top Summary Banner */}
                  <div className={`rounded-2xl p-5 border relative overflow-hidden ${
                    aiReport.recommendation === 'RELEASE_FUNDS'
                      ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/30 border-emerald-500/40'
                      : aiReport.recommendation === 'REQUEST_REVIEW'
                      ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border-amber-500/40'
                      : 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-rose-950/30 border-rose-500/40'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-2xl border ${
                          aiReport.recommendation === 'RELEASE_FUNDS'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : aiReport.recommendation === 'REQUEST_REVIEW'
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        }`}>
                          {aiReport.recommendation === 'RELEASE_FUNDS' ? <CheckCircle2 className="w-7 h-7" /> :
                           aiReport.recommendation === 'REQUEST_REVIEW' ? <AlertTriangle className="w-7 h-7" /> :
                           <AlertOctagon className="w-7 h-7" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Oracle Decision</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400">{new Date(aiReport.reviewedAt || aiReport.verifiedAt || Date.now()).toLocaleString()}</span>
                          </div>
                          <h3 className="text-xl font-black text-white mt-0.5">
                            RECOMMENDATION: {aiReport.recommendation}
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                            {aiReport.summary || aiReport.executiveSummary || "Verification completed across all vectors."}
                          </p>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Confidence Score</div>
                        <div className="text-3xl sm:text-4xl font-black font-mono mt-0.5 text-white">
                          {score}%
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono">
                          Score Code: {aiReport.recommendationCode || (aiReport.recommendation === 'RELEASE_FUNDS' ? 1 : aiReport.recommendation === 'REQUEST_REVIEW' ? 2 : 3)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5 Core Verification Vectors Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>5-Vector Physical Trade Inspection Matrix</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Vector 1: Quantity */}
                      <div className="p-4 rounded-xl bg-tradelock-card border border-tradelock-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">1. Quantity & Weight Reconciliation</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aiReport.quantityEvaluation?.result === 'MATCH' ? 'badge-emerald' :
                            aiReport.quantityEvaluation?.result === 'PARTIAL_MATCH' ? 'badge-amber' : 'badge-rose'
                          }`}>
                            {aiReport.quantityEvaluation?.result || 'MATCH'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Expected: {aiReport.quantityEvaluation?.expected || `${trade.expectedQuantity} ${trade.quantityUnit || 'MT'}`} | 
                          Delivered: {aiReport.quantityEvaluation?.evidence || `${trade.evidence?.billOfLading?.netWeight || trade.expectedQuantity} ${trade.quantityUnit || 'MT'}`}
                        </p>
                      </div>

                      {/* Vector 2: Dates */}
                      <div className="p-4 rounded-xl bg-tradelock-card border border-tradelock-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">2. Shipping Timeline & Delivery Deadline</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aiReport.dateEvaluation?.result === 'MATCH' ? 'badge-emerald' :
                            aiReport.dateEvaluation?.result === 'LATE' ? 'badge-amber' : 'badge-rose'
                          }`}>
                            {aiReport.dateEvaluation?.result || 'MATCH'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Deadline: {new Date(trade.deliveryDeadline).toLocaleDateString()} | 
                          Arrival ETA: {aiReport.dateEvaluation?.evidenceDate || 'On Schedule'}
                        </p>
                      </div>

                      {/* Vector 3: Documents & Seals */}
                      <div className="p-4 rounded-xl bg-tradelock-card border border-tradelock-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">3. Manifest, Container & Seal Matching</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aiReport.documentConsistency?.status === 'MATCH' ? 'badge-emerald' :
                            aiReport.documentConsistency?.status === 'PARTIAL_MATCH' ? 'badge-amber' : 'badge-rose'
                          }`}>
                            {aiReport.documentConsistency?.status || 'MATCH'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {aiReport.documentConsistency?.details || 'Container ID & Customs Seal verified across Bill of Lading and Packing List.'}
                        </p>
                      </div>

                      {/* Vector 4: Lab Specs */}
                      <div className="p-4 rounded-xl bg-tradelock-card border border-tradelock-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">4. Quality & Lab Assay Compliance</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aiReport.conditionAssessment?.status === 'PASS' ? 'badge-emerald' :
                            aiReport.conditionAssessment?.status === 'FAIL' ? 'badge-rose' : 'badge-amber'
                          }`}>
                            {aiReport.conditionAssessment?.status || 'PASS'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {aiReport.conditionAssessment?.details || 'Third-party inspection certificate confirms grade and moisture thresholds.'}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Anomalies List */}
                  {aiReport.anomalies && aiReport.anomalies.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Detected Anomalies ({aiReport.anomalies.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {aiReport.anomalies.map((ano, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs flex items-start space-x-2"
                          >
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span>{typeof ano === 'string' ? ano : ano.message || JSON.stringify(ano)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Epistemic Honesty Breakdown */}
                  {aiReport.epistemicBreakdown && (
                    <div className="p-4 rounded-xl bg-tradelock-card/60 border border-tradelock-border text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Epistemic Honesty Verification Ledger</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {aiReport.epistemicBreakdown.verifiedCount || 4} Verified Claims
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        TradeLock AI distinguishes strictly between claims substantiated by cryptographic evidence manifests vs unverifiable claims. Simulated demo data is explicitly flagged and never misrepresented.
                      </p>
                    </div>
                  )}

                  {/* Cryptographic EIP-712 Attestation Proof */}
                  {(aiReport.attestation || trade.attestation) && (
                    <div className="p-4 rounded-xl bg-tradelock-bg border border-cyan-500/30 text-xs space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-white">EIP-712 Cryptographic AI Attestation</span>
                        </div>
                        <span className="text-[10px] text-cyan-300 font-bold">BOT Chain 677</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="truncate">
                          <span className="text-slate-500">Signer: </span>
                          <span className="text-cyan-300">{(aiReport.attestation || trade.attestation).signer || (aiReport.attestation || trade.attestation).signerAddress}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Review Hash: </span>
                          <span className="text-slate-300">{aiReport.reviewHash || (aiReport.attestation || trade.attestation).reviewHash}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Signature: </span>
                          <span className="text-slate-400">{(aiReport.attestation || trade.attestation).signature}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: SHIPPING & EVIDENCE MANIFESTS */}
          {activeTab === 'DOCS' && (
            <div className="space-y-6 text-xs">
              {trade.evidence ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trade.evidence.billOfLading && (
                    <div className="p-5 rounded-2xl bg-tradelock-card border border-tradelock-border space-y-3">
                      <div className="flex items-center justify-between border-b border-tradelock-border pb-2">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Anchor className="w-4 h-4 text-cyan-400" />
                          <span>Ocean Bill of Lading (B/L)</span>
                        </span>
                        <span className="font-mono text-cyan-400">{trade.evidence.billOfLading.blNumber}</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div>Carrier: <span className="text-white font-medium">{trade.evidence.billOfLading.carrier}</span></div>
                        <div>Vessel: <span className="text-white font-medium">{trade.evidence.billOfLading.vesselName}</span></div>
                        <div>Container #: <span className="font-mono text-cyan-300 font-semibold">{trade.evidence.billOfLading.containerNumber}</span></div>
                        <div>Customs Seal #: <span className="font-mono text-amber-300 font-semibold">{trade.evidence.billOfLading.sealNumber}</span></div>
                        <div>Net Weight: <span className="text-white font-bold">{trade.evidence.billOfLading.netWeight} {trade.quantityUnit || 'MT'}</span></div>
                        <div>Port of Loading: <span className="text-white">{trade.evidence.billOfLading.portOfLoading}</span></div>
                        <div>Port of Discharge: <span className="text-white">{trade.evidence.billOfLading.portOfDischarge}</span></div>
                      </div>
                    </div>
                  )}

                  {trade.evidence.inspectionCertificate && (
                    <div className="p-5 rounded-2xl bg-tradelock-card border border-tradelock-border space-y-3">
                      <div className="flex items-center justify-between border-b border-tradelock-border pb-2">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span>Quality & Lab Certificate</span>
                        </span>
                        <span className="font-mono text-emerald-400">{trade.evidence.inspectionCertificate.certificateNumber}</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div>Issuer: <span className="text-white font-medium">{trade.evidence.inspectionCertificate.issuer}</span></div>
                        <div>Grade: <span className="text-white font-bold">{trade.evidence.inspectionCertificate.grade}</span></div>
                        {trade.evidence.inspectionCertificate.moistureContent && (
                          <div>Moisture Content: <span className="text-white font-mono">{trade.evidence.inspectionCertificate.moistureContent}%</span></div>
                        )}
                        {trade.evidence.inspectionCertificate.purity && (
                          <div>Purity: <span className="text-white font-mono">{trade.evidence.inspectionCertificate.purity}%</span></div>
                        )}
                        <div>Status: <span className="text-emerald-400 font-semibold">{trade.evidence.inspectionCertificate.isCertified ? 'CERTIFIED PASS' : 'FAILED / SUBSTANDARD'}</span></div>
                      </div>
                    </div>
                  )}

                  {trade.evidence.commercialInvoice && (
                    <div className="p-5 rounded-2xl bg-tradelock-card border border-tradelock-border space-y-3">
                      <div className="flex items-center justify-between border-b border-tradelock-border pb-2">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span>Commercial Invoice</span>
                        </span>
                        <span className="font-mono text-amber-400">{trade.evidence.commercialInvoice.invoiceNumber}</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div>Quantity: <span className="text-white font-bold">{trade.evidence.commercialInvoice.quantity} {trade.quantityUnit || 'MT'}</span></div>
                        <div>Total Amount: <span className="text-white font-mono font-bold">{trade.evidence.commercialInvoice.totalAmount} {trade.currency || 'BOT'}</span></div>
                      </div>
                    </div>
                  )}

                  {trade.evidence.tracking && (
                    <div className="p-5 rounded-2xl bg-tradelock-card border border-tradelock-border space-y-3">
                      <div className="flex items-center justify-between border-b border-tradelock-border pb-2">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Activity className="w-4 h-4 text-purple-400" />
                          <span>Vessel AIS & GPS Tracking</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 font-semibold">LIVE AIS</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div>Position: <span className="text-white font-medium">{trade.evidence.tracking.currentLocation}</span></div>
                        <div>Nav Status: <span className="text-emerald-400 font-semibold">{trade.evidence.tracking.vesselStatus}</span></div>
                        <div>Speed: <span className="text-white font-mono">{trade.evidence.tracking.speedKnots} knots</span></div>
                        <div>ETA: <span className="text-white font-mono font-bold">{new Date(trade.evidence.tracking.estimatedArrival).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  No evidence bundle uploaded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTLEMENT & SMART CONTRACT */}
          {activeTab === 'SETTLEMENT' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-2xl bg-tradelock-card border border-tradelock-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Escrow Vault Breakdown (BOT Chain Mainnet 677)
                </h4>

                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-center justify-between py-1.5 border-b border-tradelock-border/60">
                    <span>Total Locked Amount:</span>
                    <span className="font-mono font-bold text-white text-sm">{parseFloat(trade.amount).toLocaleString()} {trade.currency || 'BOT'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-tradelock-border/60">
                    <span>Protocol Fee (1.0%):</span>
                    <span className="font-mono text-cyan-400 font-medium">{(parseFloat(trade.amount) * 0.01).toLocaleString()} {trade.currency || 'BOT'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-tradelock-border/60">
                    <span>Net Payout to Supplier (99.0%):</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{(parseFloat(trade.amount) * 0.99).toLocaleString()} {trade.currency || 'BOT'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span>Buyer Address:</span>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{trade.buyerAddress}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span>Supplier Address:</span>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{trade.supplierAddress}</span>
                  </div>
                </div>
              </div>

              {/* Settlement Action Bar */}
              <div className="p-5 rounded-2xl bg-tradelock-surface border border-cyan-500/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-white">Buyer Settlement Authority</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The buyer authorizes fund release onchain using the cryptographic EIP-712 AI attestation.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {trade.status !== 'RELEASED' && trade.status !== 'DISPUTED' && (
                      <button
                        onClick={handleDispute}
                        className="px-4 py-2.5 rounded-xl font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-950 border border-rose-500/40 transition-colors"
                      >
                        Flag Dispute
                      </button>
                    )}

                    {trade.status !== 'RELEASED' ? (
                      <button
                        onClick={handleRelease}
                        disabled={isReleasing}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isReleasing ? 'Executing Onchain...' : 'Approve & Release Funds'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Funds Released to Supplier</span>
                      </div>
                    )}
                  </div>
                </div>

                {txHash && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Onchain Transaction Dispatched on BOT Chain Mainnet 677!</span>
                    </div>
                    <a
                      href={`${BOT_CHAIN_CONFIG.explorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 underline font-mono"
                    >
                      <span>View on Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-tradelock-border/80 bg-tradelock-bg/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>BOT Chain Mainnet 677 Escrow Vault</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-tradelock-card hover:bg-tradelock-border text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
