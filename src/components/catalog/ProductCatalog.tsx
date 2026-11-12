import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Plus, Check, Eye, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const ProductCatalog: React.FC<{
  onInspectProduct: (prod: Product) => void;
}> = ({ onInspectProduct }) => {
  const { addToCart, addToComparison, comparisonList, selectedCurrency } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [sortOption, setSortOption] = useState('popular');
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        q: searchQuery,
        category: selectedCategory,
        maxPrice,
        sort: sortOption
      });
      setProducts(res.products);
      if (res.categories && categories.length === 0) {
        setCategories(['All', ...res.categories]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery, selectedCategory, maxPrice, sortOption]);

  const handleAddToCart = async (prod: Product) => {
    await addToCart(prod.id, 1);
    setAddedItemMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Verified Digital Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            10 verified developer tools, cloud infrastructure engines, and AI platform modules with authoritative pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Comparing:</span>
          <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            {comparisonList.length} / 3 tools
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, keywords, or features..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-4 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Max Price</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {formatCurrency(convertCurrency(maxPrice, selectedCurrency), selectedCurrency)}/mo
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-slate-900 text-white">Most Popular</option>
              <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
              <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
          <p className="text-sm text-slate-300 font-semibold">No products found matching your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search keyword or increasing the price ceiling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const isComparing = comparisonList.some((p) => p.id === prod.id);
            const isJustAdded = addedItemMap[prod.id];

            return (
              <div
                key={prod.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all flex flex-col group shadow-lg"
              >
                {/* Image Banner */}
                <div className="relative h-40 bg-slate-800 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <span className="absolute top-3 left-3 text-[10px] font-medium font-mono px-2 py-0.5 rounded-full bg-slate-900/90 text-cyan-400 border border-slate-700">
                    {prod.category}
                  </span>

                  {prod.isPopular && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/90 text-white shadow">
                      Popular
                    </span>
                  )}

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-white text-xs">{prod.rating}</span>
                      <span className="text-[10px] text-slate-400">({prod.reviewsCount})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {formatCurrency(convertCurrency(prod.price, selectedCurrency), selectedCurrency)}/mo
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    {prod.features.slice(0, 2).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                        <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => onInspectProduct(prod)}
                      aria-label={`View specs for ${prod.name}`}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                      title="Inspect full specs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => addToComparison(prod)}
                      aria-label={`Compare ${prod.name}`}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isComparing
                          ? 'bg-violet-950/60 border-violet-500 text-violet-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {isComparing ? 'Comparing' : 'Compare'}
                    </button>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      aria-label={`Add ${prod.name} to cart`}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
