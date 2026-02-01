import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, Shield, Heart, Sword, Users, Ruler, BookOpen } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'text-white' }) => (
  <div className="bg-white/5 rounded-xl p-5 border border-white/5 backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-slate-400 text-sm">{label}</span>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    {subtext && <div className="text-sm text-slate-500">{subtext}</div>}
  </div>
);

const BarChart = ({ data, maxValue, color = 'bg-violet-500' }) => (
  <div className="space-y-2">
    {data.map(([label, value]) => (
      <div key={label} className="flex items-center gap-3">
        <span className="text-sm text-slate-400 w-24 truncate">{label}</span>
        <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${color} rounded-full`}
          />
        </div>
        <span className="text-sm font-medium text-white w-12 text-right">{value.toLocaleString()}</span>
      </div>
    ))}
  </div>
);

const StatsPanel = ({ monsters, allMonsters }) => {
  const stats = useMemo(() => {
    const result = {
      total: monsters.length,
      byType: {},
      byCR: {},
      bySize: {},
      bySource: {},
      avgHP: 0,
      avgAC: 0,
      maxHP: { value: 0, name: '' },
      maxAC: { value: 0, name: '' },
      legendary: 0,
      avgStats: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    };

    let totalHP = 0, totalAC = 0, hpCount = 0, acCount = 0;
    let totalStr = 0, totalDex = 0, totalCon = 0, totalInt = 0, totalWis = 0, totalCha = 0;

    monsters.forEach(m => {
      // Type
      result.byType[m.type] = (result.byType[m.type] || 0) + 1;
      
      // CR
      const cr = m.challenge_rating || '0';
      result.byCR[cr] = (result.byCR[cr] || 0) + 1;
      
      // Size
      const size = m.size?.trim() || 'Unknown';
      result.bySize[size] = (result.bySize[size] || 0) + 1;
      
      // Source
      const source = m.document__title || 'Unknown';
      result.bySource[source] = (result.bySource[source] || 0) + 1;

      // HP
      if (m.hit_points) {
        totalHP += m.hit_points;
        hpCount++;
        if (m.hit_points > result.maxHP.value) {
          result.maxHP = { value: m.hit_points, name: m.name };
        }
      }

      // AC
      const ac = Array.isArray(m.armor_class) ? m.armor_class[0]?.value : m.armor_class;
      if (typeof ac === 'number') {
        totalAC += ac;
        acCount++;
        if (ac > result.maxAC.value) {
          result.maxAC = { value: ac, name: m.name };
        }
      }

      // Legendary
      if (m.legendary_actions?.length > 0) result.legendary++;

      // Ability scores
      if (m.strength) totalStr += m.strength;
      if (m.dexterity) totalDex += m.dexterity;
      if (m.constitution) totalCon += m.constitution;
      if (m.intelligence) totalInt += m.intelligence;
      if (m.wisdom) totalWis += m.wisdom;
      if (m.charisma) totalCha += m.charisma;
    });

    result.avgHP = hpCount > 0 ? Math.round(totalHP / hpCount) : 0;
    result.avgAC = acCount > 0 ? Math.round(totalAC / acCount) : 0;
    
    const n = monsters.length || 1;
    result.avgStats = {
      str: Math.round(totalStr / n),
      dex: Math.round(totalDex / n),
      con: Math.round(totalCon / n),
      int: Math.round(totalInt / n),
      wis: Math.round(totalWis / n),
      cha: Math.round(totalCha / n),
    };

    return result;
  }, [monsters]);

  const topTypes = Object.entries(stats.byType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxTypeCount = topTypes[0]?.[1] || 1;

  const topSources = Object.entries(stats.bySource)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxSourceCount = topSources[0]?.[1] || 1;

  const sizeOrder = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Titanic'];
  const sizeData = sizeOrder
    .filter(s => stats.bySize[s])
    .map(s => [s, stats.bySize[s]]);
  const maxSizeCount = Math.max(...sizeData.map(([, v]) => v), 1);

  const crGroups = useMemo(() => {
    const groups = {
      '0-1': 0,
      '2-4': 0,
      '5-10': 0,
      '11-17': 0,
      '18-24': 0,
      '25+': 0,
    };
    Object.entries(stats.byCR).forEach(([cr, count]) => {
      const num = parseFloat(cr) || 0;
      if (num <= 1) groups['0-1'] += count;
      else if (num <= 4) groups['2-4'] += count;
      else if (num <= 10) groups['5-10'] += count;
      else if (num <= 17) groups['11-17'] += count;
      else if (num <= 24) groups['18-24'] += count;
      else groups['25+'] += count;
    });
    return Object.entries(groups).filter(([, v]) => v > 0);
  }, [stats.byCR]);
  const maxCRCount = Math.max(...crGroups.map(([, v]) => v), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Total Monsters"
          value={stats.total.toLocaleString()}
          subtext={allMonsters ? `of ${allMonsters.length.toLocaleString()} total` : undefined}
          color="text-violet-400"
        />
        <StatCard
          icon={Heart}
          label="Avg. Hit Points"
          value={stats.avgHP}
          subtext={`Max: ${stats.maxHP.value} (${stats.maxHP.name})`}
          color="text-red-400"
        />
        <StatCard
          icon={Shield}
          label="Avg. Armor Class"
          value={stats.avgAC}
          subtext={`Max: ${stats.maxAC.value} (${stats.maxAC.name})`}
          color="text-blue-400"
        />
        <StatCard
          icon={Sword}
          label="Legendary Creatures"
          value={stats.legendary}
          subtext={`${((stats.legendary / stats.total) * 100).toFixed(1)}% of selection`}
          color="text-amber-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-white">By Creature Type</h3>
          </div>
          <BarChart data={topTypes} maxValue={maxTypeCount} color="bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        </div>

        {/* By CR */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white">By Challenge Rating</h3>
          </div>
          <BarChart data={crGroups} maxValue={maxCRCount} color="bg-gradient-to-r from-orange-500 to-red-500" />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Size */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Ruler className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">By Size</h3>
          </div>
          <BarChart data={sizeData} maxValue={maxSizeCount} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* By Source */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">By Source</h3>
          </div>
          <BarChart data={topSources} maxValue={maxSourceCount} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
        </div>

        {/* Average Ability Scores */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold text-white">Avg. Ability Scores</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'STR', val: stats.avgStats.str, color: 'text-red-400', emoji: '💪' },
              { key: 'DEX', val: stats.avgStats.dex, color: 'text-green-400', emoji: '🏃' },
              { key: 'CON', val: stats.avgStats.con, color: 'text-orange-400', emoji: '❤️' },
              { key: 'INT', val: stats.avgStats.int, color: 'text-blue-400', emoji: '🧠' },
              { key: 'WIS', val: stats.avgStats.wis, color: 'text-purple-400', emoji: '👁️' },
              { key: 'CHA', val: stats.avgStats.cha, color: 'text-pink-400', emoji: '👑' },
            ].map(({ key, val, color, emoji }) => (
              <div key={key} className="text-center bg-slate-800/50 rounded-xl py-3">
                <div className="text-lg mb-1">{emoji}</div>
                <div className={`text-xs font-medium ${color}`}>{key}</div>
                <div className="text-xl font-bold text-white">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel;
