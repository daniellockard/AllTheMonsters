import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3, Grid } from 'lucide-react';
import MonsterCard from './components/MonsterCard';
import MonsterModal from './components/MonsterModal';
import MonsterComparison from './components/MonsterComparison';
import StatsPanel from './components/StatsPanel';

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Progressive rendering hook - simple approach
function useProgressiveRender(items, batchSize = 50) {
  const [renderedCount, setRenderedCount] = useState(batchSize);
  const containerRef = useRef(null);

  // Progressive rendering: render more items in batches
  useEffect(() => {
    if (renderedCount >= items.length) return;
    
    let cancelled = false;
    function renderNextBatch() {
      if (cancelled) return;
      
      setRenderedCount(prev => {
        const next = Math.min(prev + batchSize, items.length);
        return next;
      });
      
      // Schedule next batch if there are more items
      if (renderedCount < items.length) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(renderNextBatch, { timeout:100});
        } else {
          setTimeout(renderNextBatch, 16);
        }
      }
    }
    
    renderNextBatch();
    return () => { cancelled = true; };
  }, [renderedCount, items.length, batchSize]);

  // Reset when items change
  useEffect(() => {
    setRenderedCount(batchSize);
  }, [items.length, batchSize]);

  const visibleItems = items.slice(0, renderedCount);

  return { containerRef, visibleItems };
}

function App() {
  const [monsters, setMonsters] = useState([]);
  const [filteredMonsters, setFilteredMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCR, setSelectedCR] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMonsters, setComparisonMonsters] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'stats'

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load monster data
  useEffect(() => {
    const loadMonsters = async () => {
      try {
        // Add cache-busting parameter to force fresh data
        const response = await fetch(`data/monsters/all-monsters.json?t=${Date.now()}`);
        const data = await response.json();
        setMonsters(data);
        setFilteredMonsters(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading monsters:', error);
        setLoading(false);
      }
    };

    loadMonsters();
  }, []);

  // Memoize filter options to avoid recalculating on every render
  const filterOptions = useMemo(() => {
    const canonicalSizes = [
      'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Titanic'
    ];
    
    const types = [...new Set(monsters.map(m => m.type))].sort();
    const challengeRatings = [...new Set(monsters.map(m => m.challenge_rating))].sort((a, b) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      return aNum - bNum;
    });
    const sizesSet = new Set(monsters.map(m => m.size?.trim()).filter(Boolean));
    const sizes = canonicalSizes.filter(size => sizesSet.has(size));
    const sources = [...new Set(monsters.map(m => m.document__title).filter(Boolean))].sort();

    return { types, challengeRatings, sizes, sources };
  }, [monsters]);

  // Memoize filtered and sorted monsters
  const processedMonsters = useMemo(() => {
    if (monsters.length === 0) return [];

    let filtered = monsters.filter(monster => {
      const matchesSearch = monster.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                          monster.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || monster.type === selectedType;
      const matchesCR = selectedCR === 'all' || monster.challenge_rating === selectedCR;
      const matchesSize = selectedSize === 'all' || monster.size?.trim() === selectedSize;
      const matchesSource = selectedSource === 'all' || monster.document__title === selectedSource;
      
      return matchesSearch && matchesType && matchesCR && matchesSize && matchesSource;
    });

    // Sort monsters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cr':
          return parseFloat(a.challenge_rating || 0) - parseFloat(b.challenge_rating || 0);
        case 'hp':
          return (b.hit_points || 0) - (a.hit_points || 0);
        case 'ac':
          return (b.armor_class || 0) - (a.armor_class || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [monsters, debouncedSearchTerm, selectedType, selectedCR, selectedSize, selectedSource, sortBy]);

  // Update filtered monsters when processed monsters change
  useEffect(() => {
    setFilteredMonsters(processedMonsters);
  }, [processedMonsters]);

  // Simple progressive rendering for monster cards
  const { containerRef, visibleItems } = useProgressiveRender(filteredMonsters, 50);

  // Scroll to top when filtered results change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [filteredMonsters, containerRef]);

  const handleMonsterClick = useCallback((monster) => {
    setSelectedMonster(monster);
    setShowModal(true);
  }, []);

  const handleComparisonClick = useCallback((monster) => {
    // Find all monsters with the same name
    const duplicates = monsters.filter(m => m.name === monster.name);
    if (duplicates.length > 1) {
      setComparisonMonsters(duplicates);
      setShowComparison(true);
    }
  }, [monsters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dnd-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dnd-purple mx-auto mb-4"></div>
          <h2 className="text-2xl font-fantasy text-dnd-gold mb-2">Loading Monsters...</h2>
          <p className="text-dnd-light/70">Gathering all 3,207 monsters from the depths</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dnd-dark">
      {/* Header */}
      <header className="bg-gradient-to-r from-dnd-purple to-dnd-blue p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-fantasy text-dnd-gold text-center text-shadow mb-2"
          >
            All The Monsters
          </motion.h1>
          <p className="text-center text-dnd-light/80 text-lg">
            D&D 5.1 SRD Monster Compendium • {monsters.length} Monsters
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dnd-gray/20 rounded-lg p-6 mb-6 border border-dnd-purple/20"
        >
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dnd-light/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search monsters by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-dnd-light/70 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="search-input w-full"
              >
                <option value="all">All Types</option>
                {filterOptions.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Challenge Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-dnd-light/70 mb-2">Challenge Rating</label>
              <select
                value={selectedCR}
                onChange={(e) => setSelectedCR(e.target.value)}
                className="search-input w-full"
              >
                <option value="all">All CRs</option>
                {filterOptions.challengeRatings.map(cr => (
                  <option key={cr} value={cr}>CR {cr}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-dnd-light/70 mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="search-input w-full"
              >
                <option value="all">All Sizes</option>
                {filterOptions.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-dnd-light/70 mb-2">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="search-input w-full"
              >
                <option value="all">All Sources</option>
                {filterOptions.sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-dnd-light/70 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="search-input w-full"
              >
                <option value="name">Name</option>
                <option value="cr">Challenge Rating</option>
                <option value="hp">Hit Points</option>
                <option value="ac">Armor Class</option>
              </select>
            </div>
          </div>

          {/* Results Count and View Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-dnd-light/70">
              Showing {filteredMonsters.length} of {monsters.length} monsters
            </p>
            
            {/* View Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-dnd-purple text-white' 
                    : 'bg-dnd-gray/30 text-dnd-light hover:bg-dnd-gray/50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'stats' 
                    ? 'bg-dnd-purple text-white' 
                    : 'bg-dnd-gray/30 text-dnd-light hover:bg-dnd-gray/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Stats
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Monster Grid with Virtual Scrolling */}
              <div 
                ref={containerRef}
                className="h-[600px] overflow-y-auto"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleItems.map((monster, index) => (
                    <motion.div
                      key={monster.slug}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: (index % 10) * 0.01,
                        ease: "easeOut"
                      }}
                    >
                      <MonsterCard 
                        monster={monster} 
                        onClick={() => handleMonsterClick(monster)}
                        onCompare={handleComparisonClick}
                        hasDuplicates={monsters.filter(m => m.name === monster.name).length > 1}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Panel */}
              <StatsPanel monsters={filteredMonsters} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {filteredMonsters.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🐉</div>
            <h3 className="text-xl font-fantasy text-dnd-gold mb-2">No Monsters Found</h3>
            <p className="text-dnd-light/70">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedMonster && (
          <MonsterModal
            monster={selectedMonster}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && comparisonMonsters.length > 0 && (
          <MonsterComparison
            monsters={comparisonMonsters}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App; 