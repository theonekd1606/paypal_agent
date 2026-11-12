import React from 'react';
import { X, Star, Check, Plus, ShieldCheck, Zap, Layers, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForDetail, setSelectedProductForDetail, addToCart, addToComparison, comparisonList, selectedCurrency } = useCart();

  if (!selectedProductForDetail) return null;

  const prod = selectedProductForDetail;
  const isComparing = comparisonList.some((p) => p.id === prod.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header / Media */}
        <div className="relative h-48 bg-slate-800 overflow-hidden">
          <img
            src={prod.image}
            alt={prod.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={() => setSelectedProductForDetail(null)}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {prod.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-1">{prod.name}</h2>
              <p className="text-xs text-slate-300">{prod.tagline}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-cyan-400">
                {formatCurrency(convertCurrency(prod.price, selectedCurrency), selectedCurrency)}
              </span>
              <span className="text-[11px] text-slate-400 block">/ {prod.billingPeriod}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-1.5">
              Overview
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs">{prod.description}</p>
          </div>

          {/* Technical Specs */}
          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Specifications</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono">
              {Object.entries(prod.specs).map(([key, val]) => (
                <div key={key}>
                  <span className="text-[10px] text-slate-400 block">{key}</span>
                  <span className="text-slate-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
              Core Capabilities & Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prod.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-[11px] leading-tight">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & PayPal Compatibility Badge */}
          <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-800/30 flex items-center gap-2.5 text-violet-300">
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Eligible for PayPal Sandbox instant subscription & sandbox token authorization.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => addToComparison(prod)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              isComparing
                ? 'bg-violet-950/60 border-violet-500 text-violet-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isComparing ? 'In Comparison Matrix' : 'Add to Compare'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductForDetail(null)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                addToCart(prod.id, 1);
                setSelectedProductForDetail(null);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart ({formatCurrency(convertCurrency(prod.price, selectedCurrency), selectedCurrency)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
