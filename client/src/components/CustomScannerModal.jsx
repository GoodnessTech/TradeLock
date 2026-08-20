import React, { useState } from 'react';
import { X, Cpu, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyCustom } from '../services/api';

export default function CustomScannerModal({ isOpen, onClose }) {
  const [poJson, setPoJson] = useState(JSON.stringify({
    commodity: "Grade 1 Cocoa Beans",
    expectedQuantity: 10.0,
    unit: "Metric Tons",
    deliveryDeadline: "2026-09-30",
    qualityParameters: {
      moistureMax: 7.5,
      expectedGrade: "Grade 1"
    }
  }, null, 2));

  const [evidenceJson, setEvidenceJson] = useState(JSON.stringify({
    billOfLading: {
      blNumber: "MSCU-ABJ-HAM-98214",
      netWeight: 10.0,
      containerNumber: "MSKU-948271-0",
      sealNumber: "CI-SEAL-88210",
      issueDate: "2026-08-15"
    },
    packingList: {
      containerNumber: "MSKU-948271-0",
      sealNumber: "CI-SEAL-88210",
      netWeight: 10.0
    },
    inspectionCertificate: {
      issuer: "SGS Agriculture",
      grade: "Grade 1",
      moistureContent: 6.8,
      containerNumber: "MSKU-948271-0"
    },
    tamperDetected: false
  }, null, 2));

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  if (!isOpen) return null;

  const handleRunScan = async () => {
    setIsScanning(true);
    setJsonError(null);
    try {
      const po = JSON.parse(poJson);
      const evidence = JSON.parse(evidenceJson);
      const res = await verifyCustom({ po, evidence });
      if (res.success) {
        setScanResult(res.report);
      } else {
        setJsonError(res.error || 'Failed to scan');
      }
    } catch (e) {
      setJsonError('Invalid JSON input: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const loadPreset = (type) => {
    if (type === 'MATCH') {
      setPoJson(JSON.stringify({
        commodity: "Grade 1 Cocoa Beans",
        expectedQuantity: 10.0,
        unit: "Metric Tons",
        deliveryDeadline: "2026-09-30",
        qualityParameters: { moistureMax: 7.5, expectedGrade: "Grade 1" }
      }, null, 2));
      setEvidenceJson(JSON.stringify({
        billOfLading: { blNumber: "MSCU-ABJ-HAM-98214", netWeight: 10.0, containerNumber: "MSKU-948271-0", sealNumber: "CI-SEAL-88210" },
        packingList: { containerNumber: "MSKU-948271-0", sealNumber: "CI-SEAL-88210", netWeight: 10.0 },
        inspectionCertificate: { issuer: "SGS Agriculture", grade: "Grade 1", moistureContent: 6.8, containerNumber: "MSKU-948271-0" },
        tamperDetected: false
      }, null, 2));
    } else if (type === 'SHORTFALL') {
      setPoJson(JSON.stringify({
        commodity: "Electrolytic Copper Cathodes",
        expectedQuantity: 50.0,
        unit: "Metric Tons",
        deliveryDeadline: "2026-09-10"
      }, null, 2));
      setEvidenceJson(JSON.stringify({
        billOfLading: { blNumber: "HLCU-ANF-HOU-77218", netWeight: 41.5, containerNumber: "HLXU-882910-1", sealNumber: "CL-SEAL-01" },
        packingList: { containerNumber: "HLXU-999999-9", sealNumber: "CL-SEAL-DIFF", netWeight: 41.5 }, // Mismatched
        tamperDetected: true
      }, null, 2));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-tradelock-surface border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 my-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-tradelock-card hover:bg-tradelock-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Live AI Evidence & Anomaly Scanner</h2>
            <p className="text-xs text-slate-400">
              Test any custom PO specifications against multi-modal delivery evidence packages
            </p>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center space-x-2 mb-4 text-xs">
          <span className="text-slate-400">Load Test Preset:</span>
          <button
            onClick={() => loadPreset('MATCH')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 font-semibold"
          >
            Clean Match (RELEASE_FUNDS)
          </button>
          <button
            onClick={() => loadPreset('SHORTFALL')}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 font-semibold"
          >
            Cargo Shortfall & Tamper (FLAG_DISPUTE)
          </button>
        </div>

        {/* Inputs: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1">
              Purchase Order Specification (PO JSON)
            </label>
            <textarea
              rows={9}
              value={poJson}
              onChange={(e) => setPoJson(e.target.value)}
              className="w-full p-3 bg-tradelock-card border border-tradelock-border rounded-xl text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-sans font-semibold mb-1">
              Delivery Evidence Bundle (Evidence JSON)
            </label>
            <textarea
              rows={9}
              value={evidenceJson}
              onChange={(e) => setEvidenceJson(e.target.value)}
              className="w-full p-3 bg-tradelock-card border border-tradelock-border rounded-xl text-emerald-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {jsonError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
            {jsonError}
          </div>
        )}

        {/* Scan Action */}
        <div className="flex items-center justify-end space-x-3 mb-6">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isScanning ? 'Analyzing Multi-Vector Evidence...' : 'Run Live AI Verification'}</span>
          </button>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="p-5 rounded-2xl bg-tradelock-card border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  scanResult.recommendation === 'RELEASE_FUNDS' ? 'badge-emerald' :
                  scanResult.recommendation === 'REQUEST_REVIEW' ? 'badge-amber' : 'badge-rose'
                }`}>
                  AI DECISION: {scanResult.recommendation}
                </span>
                <span className="text-xs text-slate-400 font-mono">Score: {scanResult.confidencePercentage}%</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">ECDSA Attestation Signed</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {scanResult.executiveSummary}
            </p>

            {/* Vector breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {Object.values(scanResult.vectors || {}).map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-tradelock-surface border border-tradelock-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{v.label}</span>
                    <span className={`text-[10px] font-bold ${v.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {v.status} ({v.score}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{v.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
