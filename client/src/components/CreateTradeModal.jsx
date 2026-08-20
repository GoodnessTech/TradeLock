import React, { useState } from 'react';
import { X, Lock, Plus, Calendar, MapPin, DollarSign, ShieldAlert, Check } from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../contracts/config';

export default function CreateTradeModal({ isOpen, onClose, onCreateTrade, account, isCorrectNetwork }) {
  const [formData, setFormData] = useState({
    title: '15 Metric Tons Premium Cashew Nuts W240',
    commodity: 'Raw Cashew Nuts',
    category: 'Agricultural Commodities',
    amount: '12500',
    currency: 'BOT',
    expectedQuantity: '15.0',
    unit: 'Metric Tons',
    buyerName: 'EuroNut Trading B.V. (Rotterdam, Netherlands)',
    buyerAddress: account || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    supplierName: 'West African Agro Exports (Cotonou, Benin)',
    supplierAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    originPort: 'Port of Cotonou (BJCOO)',
    destinationPort: 'Port of Rotterdam (NLRTM)',
    incoterm: 'CIF Rotterdam',
    deliveryDays: '14',
    moistureMax: '8.0',
    gradeSpec: 'Grade W240 Export Standard',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const deadline = new Date(Date.now() + parseInt(formData.deliveryDays) * 86400000).toISOString();
      await onCreateTrade({
        ...formData,
        deliveryDeadline: deadline,
        qualityParameters: {
          moistureMax: parseFloat(formData.moistureMax),
          expectedGrade: formData.gradeSpec,
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-tradelock-surface border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-tradelock-card hover:bg-tradelock-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Create Purchase Order & Escrow</h2>
            <p className="text-xs text-slate-400">
              Lock trade payment on <span className="text-cyan-400 font-semibold">BOT Chain Mainnet (Chain ID 677)</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Commodity Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contract / PO Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Commodity / Item</label>
              <input
                type="text"
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Amount & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Escrow Amount (BOT)</label>
              <input
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white font-mono focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expected Quantity</label>
              <input
                type="number"
                step="any"
                value={formData.expectedQuantity}
                onChange={(e) => setFormData({ ...formData, expectedQuantity: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white font-mono focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit of Measure</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="Metric Tons">Metric Tons (MT)</option>
                <option value="Kilograms">Kilograms (kg)</option>
                <option value="Containers">20ft / 40ft Containers</option>
                <option value="Units">Units / Pieces</option>
              </select>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Buyer (Company & Address)</label>
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none mb-1.5"
                placeholder="Buyer Name"
                required
              />
              <input
                type="text"
                value={formData.buyerAddress}
                onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white font-mono text-[11px] focus:border-cyan-400 focus:outline-none"
                placeholder="0x... Buyer Address"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supplier (Company & Address)</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none mb-1.5"
                placeholder="Supplier Name"
                required
              />
              <input
                type="text"
                value={formData.supplierAddress}
                onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white font-mono text-[11px] focus:border-cyan-400 focus:outline-none"
                placeholder="0x... Supplier Address"
                required
              />
            </div>
          </div>

          {/* Shipping Route & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Origin Port</label>
              <input
                type="text"
                value={formData.originPort}
                onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Destination Port</label>
              <input
                type="text"
                value={formData.destinationPort}
                onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Incoterm</label>
              <select
                value={formData.incoterm}
                onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="CIF Rotterdam">CIF (Cost, Insurance & Freight)</option>
                <option value="FOB Origin">FOB (Free On Board)</option>
                <option value="CFR Destination">CFR (Cost and Freight)</option>
                <option value="DAP Destination">DAP (Delivered at Place)</option>
              </select>
            </div>
          </div>

          {/* Quality Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quality Grade Specification</label>
              <input
                type="text"
                value={formData.gradeSpec}
                onChange={(e) => setFormData({ ...formData, gradeSpec: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.moistureMax}
                onChange={(e) => setFormData({ ...formData, moistureMax: e.target.value })}
                className="w-full px-3 py-2 bg-tradelock-card border border-tradelock-border rounded-xl text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Fee & Escrow Info */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-slate-300 flex items-center justify-between">
            <div>
              <div className="font-semibold text-cyan-300">Smart Contract Escrow Security</div>
              <div className="text-[11px] text-slate-400">Protocol Fee: 1.0% on successful release • Refundable if breach</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-white">{formData.amount} BOT</div>
              <div className="text-[10px] text-cyan-400 font-mono">Net: {(formData.amount * 0.99).toFixed(2)} BOT</div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 bg-tradelock-card hover:bg-tradelock-border transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
            >
              {isSubmitting ? 'Creating Escrow...' : 'Deploy Escrow on BOT Chain (677)'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
