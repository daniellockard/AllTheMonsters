import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import MonsterCard from './components/MonsterCard';
import MonsterModal from './components/MonsterModal';
import MonsterComparison from './components/MonsterComparison';
import StatsPanel from './components/StatsPanel';

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

  // Filter and sort monsters
  useEffect(() => {
    let filtered = monsters.filter(monster => {
      const matchesSearch = monster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          monster.type.toLowerCase().includes(searchTerm.toLowerCase());
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

    setFilteredMonsters(filtered);
  }, [monsters, searchTerm, selectedType, selectedCR, selectedSize, selectedSource, sortBy]);

  // Get unique values for filters
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
  
  // Get unique document sources
  const sources = [...new Set(monsters.map(m => m.document__title).filter(Boolean))].sort();

  const handleMonsterClick = (monster) => {
    setSelectedMonster(monster);
    setShowModal(true);
  };

  const handleComparisonClick = (monster) => {
    // Find all monsters with the same name
    const duplicates = monsters.filter(m => m.name === monster.name);
    if (duplicates.length > 1) {
      setComparisonMonsters(duplicates);
      setShowComparison(true);
    }
  };

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
                {types.map(type => (
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
                {challengeRatings.map(cr => (
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
                {sizes.map(size => (
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
                {sources.map(source => (
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

          {/* Results Count */}
          <div className="text-center">
            <p className="text-dnd-light/70">
              Showing {filteredMonsters.length} of {monsters.length} monsters
            </p>
          </div>
        </motion.div>

        {/* Stats Panel */}
        <StatsPanel monsters={filteredMonsters} />

        {/* Monster Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredMonsters.map((monster, index) => (
              <motion.div
                key={monster.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
              >
                <MonsterCard 
                  monster={monster} 
                  onClick={() => handleMonsterClick(monster)}
                  onCompare={handleComparisonClick}
                  hasDuplicates={monsters.filter(m => m.name === monster.name).length > 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

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