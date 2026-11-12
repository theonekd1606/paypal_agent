import React from 'react';
import { Sparkles, Trash2, Check, X, ShoppingBag, Plus, ArrowRight, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const ProductComparison: React.FC<{ onNavigateToCatalog: () => void }> = ({ onNavigateToCatalog }) => {
  const { comparisonList, removeFromComparison, clearComparison, addToCart, setIsCartOpen, selectedCurrency } = useCart();

  if (comparisonList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white">No Products Selected for Comparison</h2>
          <p className="text-xs text-slate-400">
            Browse our verified digital product catalog and click "Compare" on up to 3 tools to analyze features and specs side-by-side.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium text-xs hover:opacity-95 shadow-md"
          >
            Explore Product Catalog
          </button>
        </div>
      </div>
    );
  }

  // Calculate union of specs and features
  const allFeatures = Array.from(new Set(comparisonList.flatMap((p) => p.features)));
  const allSpecKeys = Array.from(new Set(comparisonList.flatMap((p) => Object.keys(p.specs))));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Intelligent Specification Comparison</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare specs, pricing, latency benchmarks, and capabilities across candidate tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearComparison}
            className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
          <button
            onClick={onNavigateToCatalog}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Tools</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60">
              <th className="p-4 w-1/4 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                Product Overview
              </th>
              {comparisonList.map((prod) => (
                <th key={prod.id} className="p-4 w-1/4 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {prod.category}
                      </span>
                      <button
                        onClick={() => removeFromComparison(prod.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-sm">{prod.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-cyan-400">
                        {formatCurrency(convertCurrency(prod.price, selectedCurrency), selectedCurrency)}
                      </span>
                      <span className="text-[10px] text-slate-400">/ mo</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold text-white">{prod.rating}</span>
                      <span className="text-slate-500">({prod.reviewsCount})</span>
                    </div>
                    <button
                      onClick={() => addToCart(prod.id, 1)}
                      className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 shadow"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {/* Tagline */}
            <tr>
              <td className="p-4 font-semibold text-slate-300 bg-slate-950/20">Summary</td>
              {comparisonList.map((prod) => (
                <td key={prod.id} className="p-4 text-slate-300 leading-relaxed">
                  {prod.tagline}
                </td>
              ))}
            </tr>

            {/* Technical Specifications Section */}
            <tr className="bg-slate-950/60">
              <td colSpan={comparisonList.length + 1} className="p-3 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Technical Specifications & SLA
              </td>
            </tr>
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="p-4 font-semibold text-slate-400 bg-slate-950/20">{key}</td>
                {comparisonList.map((prod) => (
                  <td key={prod.id} className="p-4 font-mono text-slate-200">
                    {prod.specs[key] || '—'}
                  </td>
                ))}
              </tr>
            ))}

            {/* Features Matrix Section */}
            <tr className="bg-slate-950/60">
              <td colSpan={comparisonList.length + 1} className="p-3 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                Features & Capabilities Matrix
              </td>
            </tr>
            {allFeatures.map((feat) => (
              <tr key={feat}>
                <td className="p-3.5 text-slate-300 bg-slate-950/20">{feat}</td>
                {comparisonList.map((prod) => {
                  const hasFeature = prod.features.includes(feat);
                  return (
                    <td key={prod.id} className="p-3.5">
                      {hasFeature ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[11px]">Included</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-600">
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                          <span className="text-[11px]">Not Available</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
