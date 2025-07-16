import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, Shield, Heart, Zap } from 'lucide-react';

const StatsPanel = ({ monsters }) => {
  // Calculate statistics
  const stats = {
    total: monsters.length,
    byType: {},
    byCR: {},
    bySize: {},
    avgHP: 0,
    avgAC: 0,
    avgSTR: 0,
    avgDEX: 0,
    avgCON: 0,
    avgINT: 0,
    avgWIS: 0,
    avgCHA: 0,
  };

  let totalHP = 0, totalAC = 0, totalSTR = 0, totalDEX = 0, totalCON = 0, totalINT = 0, totalWIS = 0, totalCHA = 0;
  let hpCount = 0, acCount = 0;

  monsters.forEach(monster => {
    // Count by type
    const type = monster.type || 'Unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Count by CR
    const cr = monster.challenge_rating || 'Unknown';
    stats.byCR[cr] = (stats.byCR[cr] || 0) + 1;

    // Count by size
    const size = monster.size?.trim() || 'Unknown';
    stats.bySize[size] = (stats.bySize[size] || 0) + 1;
    
    // Debug: log any unexpected sizes
    if (!['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Titanic', 'Unknown'].includes(size)) {
      console.log('Unexpected size:', size, 'from monster:', monster.name);
    }

    // Sum stats for averages
    if (monster.hit_points) {
      totalHP += monster.hit_points;
      hpCount++;
    }

    if (monster.armor_class) {
      const ac = Array.isArray(monster.armor_class) ? monster.armor_class[0]?.value : monster.armor_class;
      if (typeof ac === 'number') {
        totalAC += ac;
        acCount++;
      }
    }

    if (monster.strength) totalSTR += monster.strength;
    if (monster.dexterity) totalDEX += monster.dexterity;
    if (monster.constitution) totalCON += monster.constitution;
    if (monster.intelligence) totalINT += monster.intelligence;
    if (monster.wisdom) totalWIS += monster.wisdom;
    if (monster.charisma) totalCHA += monster.charisma;
  });

  // Calculate averages
  if (hpCount > 0) stats.avgHP = Math.round(totalHP / hpCount);
  if (acCount > 0) stats.avgAC = Math.round(totalAC / acCount);
  stats.avgSTR = Math.round(totalSTR / monsters.length);
  stats.avgDEX = Math.round(totalDEX / monsters.length);
  stats.avgCON = Math.round(totalCON / monsters.length);
  stats.avgINT = Math.round(totalINT / monsters.length);
  stats.avgWIS = Math.round(totalWIS / monsters.length);
  stats.avgCHA = Math.round(totalCHA / monsters.length);

  // Get top types
  const topTypes = Object.entries(stats.byType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Get top CRs
  const topCRs = Object.entries(stats.byCR)
    .sort(([a], [b]) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      return aNum - bNum;
    })
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dnd-gray/20 rounded-lg p-6 mb-6 border border-dnd-purple/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-dnd-gold" />
        <h3 className="text-lg font-fantasy text-dnd-gold">Statistics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Stats */}
        <div className="bg-dnd-dark/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-dnd-light/70 mb-3">Average Stats</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-dnd-red" />
                <span className="text-xs text-dnd-light/70">HP:</span>
              </div>
              <span className="text-sm font-semibold text-dnd-light">{stats.avgHP}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-dnd-blue" />
                <span className="text-xs text-dnd-light/70">AC:</span>
              </div>
              <span className="text-sm font-semibold text-dnd-light">{stats.avgAC}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dnd-light/70">STR:</span>
              <span className="text-sm font-semibold text-dnd-light">{stats.avgSTR}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dnd-light/70">DEX:</span>
              <span className="text-sm font-semibold text-dnd-light">{stats.avgDEX}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dnd-light/70">CON:</span>
              <span className="text-sm font-semibold text-dnd-light">{stats.avgCON}</span>
            </div>
          </div>
        </div>

        {/* Top Types */}
        <div className="bg-dnd-dark/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-dnd-light/70 mb-3">Top Types</h4>
          <div className="space-y-2">
            {topTypes.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-dnd-light/70 truncate">{type}</span>
                <span className="text-sm font-semibold text-dnd-light">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top CRs */}
        <div className="bg-dnd-dark/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-dnd-light/70 mb-3">Challenge Ratings</h4>
          <div className="space-y-2">
            {topCRs.map(([cr, count]) => (
              <div key={cr} className="flex items-center justify-between">
                <span className="text-xs text-dnd-light/70">CR {cr}</span>
                <span className="text-sm font-semibold text-dnd-light">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-dnd-dark/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-dnd-light/70 mb-3">Sizes</h4>
          <div className="space-y-2">
            {Object.entries(stats.bySize)
              .sort(([a], [b]) => {
                const canonicalOrder = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Titanic'];
                const aIndex = canonicalOrder.indexOf(a);
                const bIndex = canonicalOrder.indexOf(b);
                return aIndex - bIndex;
              })
              .map(([size, count]) => (
                <div key={size} className="flex items-center justify-between">
                  <span className="text-xs text-dnd-light/70 capitalize">{size}</span>
                  <span className="text-sm font-semibold text-dnd-light">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dnd-purple/20">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-dnd-gold" />
            <span className="text-dnd-light/70">Total:</span>
            <span className="font-semibold text-dnd-light">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-dnd-purple" />
            <span className="text-dnd-light/70">Types:</span>
            <span className="font-semibold text-dnd-light">{Object.keys(stats.byType).length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-dnd-blue" />
            <span className="text-dnd-light/70">CRs:</span>
            <span className="font-semibold text-dnd-light">{Object.keys(stats.byCR).length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel; 