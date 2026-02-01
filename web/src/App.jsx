import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, BarChart3, LayoutGrid, Sparkles } from 'lucide-react';
import MonsterCard from './components/MonsterCard';
import MonsterModal from './components/MonsterModal';
import StatsPanel from './components/StatsPanel';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Pre-computed search index for fast filtering
function buildSearchIndex(monsters) {
  return monsters.map(m => ({
    ...m,
    _searchText: `${m.name} ${m.type} ${m.size || ''} ${m.document__title || ''}`.toLowerCase()
  }));
}

function App() {
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    cr: 'all', 
    size: 'all',
    source: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const parentRef = useRef(null);
  const debouncedSearch = useDebounce(searchTerm, 150);

  // Load data
  useEffect(() => {
    const loadMonsters = async () => {
      try {
        const response = await fetch('data/monsters/all-monsters.json');
        const data = await response.json();
        setMonsters(buildSearchIndex(data));
        setLoading(false);
      } catch (error) {
        console.error('Error loading monsters:', error);
        setLoading(false);
      }
    };
    loadMonsters();
  }, []);

  // Memoized filter options
  const filterOptions = useMemo(() => {
    if (monsters.length === 0) return { types: [], crs: [], sizes: [], sources: [] };
    
    const types = [...new Set(monsters.map(m => m.type))].filter(Boolean).sort();
    const crs = [...new Set(monsters.map(m => m.challenge_rating))].filter(v => v !== undefined).sort((a, b) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      return aNum - bNum;
    });
    const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Titanic'].filter(
      s => monsters.some(m => m.size?.trim() === s)
    );
    const sources = [...new Set(monsters.map(m => m.document__title).filter(Boolean))].sort();
    
    return { types, crs, sizes, sources };
  }, [monsters]);

  // Fast filtered & sorted monsters
  const filteredMonsters = useMemo(() => {
    if (monsters.length === 0) return [];
    
    const searchLower = debouncedSearch.toLowerCase();
    
    let result = monsters.filter(m => {
      if (searchLower && !m._searchText.includes(searchLower)) return false;
      if (filters.type !== 'all' && m.type !== filters.type) return false;
      if (filters.cr !== 'all' && m.challenge_rating !== filters.cr) return false;
      if (filters.size !== 'all' && m.size?.trim() !== filters.size) return false;
      if (filters.source !== 'all' && m.document__title !== filters.source) return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'cr': return (parseFloat(a.challenge_rating) || 0) - (parseFloat(b.challenge_rating) || 0);
        case 'cr-desc': return (parseFloat(b.challenge_rating) || 0) - (parseFloat(a.challenge_rating) || 0);
        case 'hp': return (b.hit_points || 0) - (a.hit_points || 0);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [monsters, debouncedSearch, filters, sortBy]);

  // Determine columns based on screen width
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    if (window.innerWidth < 1536) return 3;
    return 4;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group monsters into rows for virtualization
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredMonsters.length; i += columnCount) {
      result.push(filteredMonsters.slice(i, i + columnCount));
    }
    return result;
  }, [filteredMonsters, columnCount]);

  // Virtual list
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340,
    overscan: 3,
  });

  const handleMonsterClick = useCallback((monster) => {
    setSelectedMonster(monster);
  }, []);

  const clearFilters = () => {
    setFilters({ type: 'all', cr: 'all', size: 'all', source: 'all' });
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length + (searchTerm ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-spin opacity-75 blur-sm" />
            <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            Loading Monsters
          </h2>
          <p className="text-slate-400">Summoning 3,207 creatures from the depths...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-xl">🐉</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">All The Monsters</h1>
                <p className="text-xs text-slate-400">{monsters.length.toLocaleString()} creatures</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search monsters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'stats' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                    <div className="relative">
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="all">All Types</option>
                        {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* CR */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Challenge Rating</label>
                    <div className="relative">
                      <select
                        value={filters.cr}
                        onChange={(e) => setFilters(f => ({ ...f, cr: e.target.value }))}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="all">All CRs</option>
                        {filterOptions.crs.map(cr => <option key={cr} value={cr}>CR {cr}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Size</label>
                    <div className="relative">
                      <select
                        value={filters.size}
                        onChange={(e) => setFilters(f => ({ ...f, size: e.target.value }))}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="all">All Sizes</option>
                        {filterOptions.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Source</label>
                    <div className="relative">
                      <select
                        value={filters.source}
                        onChange={(e) => setFilters(f => ({ ...f, source: e.target.value }))}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="all">All Sources</option>
                        {filterOptions.sources.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Sort By</label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="name">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="cr">CR (Low-High)</option>
                        <option value="cr-desc">CR (High-Low)</option>
                        <option value="hp">Hit Points</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Clear */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Results Bar */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing <span className="text-white font-medium">{filteredMonsters.length.toLocaleString()}</span> of {monsters.length.toLocaleString()} monsters
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-violet-400 hover:text-violet-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 pb-8">
        {viewMode === 'stats' ? (
          <StatsPanel monsters={filteredMonsters} allMonsters={monsters} />
        ) : (
          <>
            {filteredMonsters.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No monsters found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <div
                ref={parentRef}
                className="h-[calc(100vh-200px)] overflow-auto scrollbar-thin"
                style={{ contain: 'strict' }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className={`grid gap-4 h-full ${
                          columnCount === 1 ? 'grid-cols-1' :
                          columnCount === 2 ? 'grid-cols-2' :
                          columnCount === 3 ? 'grid-cols-3' :
                          'grid-cols-4'
                        }`}>
                          {row.map((monster) => (
                            <MonsterCard
                              key={monster.slug}
                              monster={monster}
                              onClick={() => handleMonsterClick(monster)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedMonster && (
          <MonsterModal
            monster={selectedMonster}
            onClose={() => setSelectedMonster(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
