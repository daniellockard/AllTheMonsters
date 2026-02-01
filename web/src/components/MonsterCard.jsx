import React, { memo } from 'react';
import { Shield, Heart, Zap, Sword, Crown, Footprints } from 'lucide-react';

// Type-based gradient colors
const typeGradients = {
  aberration: 'from-purple-600/20 to-indigo-900/20',
  beast: 'from-emerald-600/20 to-green-900/20',
  celestial: 'from-amber-500/20 to-yellow-900/20',
  construct: 'from-slate-500/20 to-zinc-800/20',
  dragon: 'from-red-600/20 to-orange-900/20',
  elemental: 'from-cyan-500/20 to-blue-900/20',
  fey: 'from-pink-500/20 to-fuchsia-900/20',
  fiend: 'from-red-800/20 to-rose-950/20',
  giant: 'from-orange-600/20 to-amber-900/20',
  humanoid: 'from-blue-500/20 to-indigo-900/20',
  monstrosity: 'from-violet-600/20 to-purple-900/20',
  ooze: 'from-lime-500/20 to-green-900/20',
  plant: 'from-green-600/20 to-emerald-900/20',
  swarm: 'from-yellow-500/20 to-amber-900/20',
  undead: 'from-gray-600/20 to-slate-900/20',
};

const typeBorderColors = {
  aberration: 'border-purple-500/30 hover:border-purple-400/50',
  beast: 'border-emerald-500/30 hover:border-emerald-400/50',
  celestial: 'border-amber-500/30 hover:border-amber-400/50',
  construct: 'border-slate-500/30 hover:border-slate-400/50',
  dragon: 'border-red-500/30 hover:border-red-400/50',
  elemental: 'border-cyan-500/30 hover:border-cyan-400/50',
  fey: 'border-pink-500/30 hover:border-pink-400/50',
  fiend: 'border-red-700/30 hover:border-red-600/50',
  giant: 'border-orange-500/30 hover:border-orange-400/50',
  humanoid: 'border-blue-500/30 hover:border-blue-400/50',
  monstrosity: 'border-violet-500/30 hover:border-violet-400/50',
  ooze: 'border-lime-500/30 hover:border-lime-400/50',
  plant: 'border-green-500/30 hover:border-green-400/50',
  swarm: 'border-yellow-500/30 hover:border-yellow-400/50',
  undead: 'border-gray-500/30 hover:border-gray-400/50',
};

const typeTextColors = {
  aberration: 'text-purple-400',
  beast: 'text-emerald-400',
  celestial: 'text-amber-400',
  construct: 'text-slate-400',
  dragon: 'text-red-400',
  elemental: 'text-cyan-400',
  fey: 'text-pink-400',
  fiend: 'text-red-500',
  giant: 'text-orange-400',
  humanoid: 'text-blue-400',
  monstrosity: 'text-violet-400',
  ooze: 'text-lime-400',
  plant: 'text-green-400',
  swarm: 'text-yellow-400',
  undead: 'text-gray-400',
};

const sizeEmojis = {
  tiny: '🦋',
  small: '🐭',
  medium: '👤',
  large: '🐻',
  huge: '🦣',
  gargantuan: '🐋',
  titanic: '🌋',
};

const getCRColor = (cr) => {
  const num = parseFloat(cr) || 0;
  if (num <= 1) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (num <= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (num <= 10) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  if (num <= 17) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (num <= 24) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  return 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-fuchsia-300 border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/20';
};

const getModifier = (score) => {
  if (!score) return '+0';
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const getAC = (ac) => {
  if (Array.isArray(ac)) return ac[0]?.value || ac[0] || '?';
  return ac || '?';
};

const MonsterCard = memo(({ monster, onClick }) => {
  const typeLower = monster.type?.toLowerCase() || 'humanoid';
  const gradient = typeGradients[typeLower] || typeGradients.humanoid;
  const borderColor = typeBorderColors[typeLower] || typeBorderColors.humanoid;
  const textColor = typeTextColors[typeLower] || typeTextColors.humanoid;
  const sizeLower = monster.size?.toLowerCase() || 'medium';

  return (
    <div
      onClick={onClick}
      className={`group relative h-80 bg-gradient-to-br ${gradient} backdrop-blur-sm rounded-2xl border ${borderColor} p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 overflow-hidden isolate hover:z-10`}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-0" />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg leading-tight truncate mb-1">
            {monster.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`${textColor} font-medium`}>{monster.type}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              {sizeEmojis[sizeLower] || '❓'} {monster.size}
            </span>
          </div>
        </div>
        
        {/* CR Badge */}
        <div className={`px-2.5 py-1 rounded-lg text-sm font-semibold border ${getCRColor(monster.challenge_rating)}`}>
          CR {monster.challenge_rating || '0'}
        </div>
      </div>

      {/* Combat Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400 text-sm">AC</span>
          <span className="text-white font-semibold ml-auto">{getAC(monster.armor_class)}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-slate-400 text-sm">HP</span>
          <span className="text-white font-semibold ml-auto">{monster.hit_points || '?'}</span>
        </div>
      </div>

      {/* Ability Scores - Compact Grid */}
      <div className="grid grid-cols-6 gap-1.5 mb-4">
        {[
          { key: 'STR', val: monster.strength, color: 'text-red-400' },
          { key: 'DEX', val: monster.dexterity, color: 'text-green-400' },
          { key: 'CON', val: monster.constitution, color: 'text-orange-400' },
          { key: 'INT', val: monster.intelligence, color: 'text-blue-400' },
          { key: 'WIS', val: monster.wisdom, color: 'text-purple-400' },
          { key: 'CHA', val: monster.charisma, color: 'text-pink-400' },
        ].map(({ key, val, color }) => (
          <div key={key} className="text-center bg-white/5 rounded-lg py-1.5 px-1">
            <div className={`text-[10px] font-medium ${color} mb-0.5`}>{key}</div>
            <div className="text-white text-sm font-semibold">{val || '—'}</div>
            <div className="text-slate-500 text-[10px]">{getModifier(val)}</div>
          </div>
        ))}
      </div>

      {/* Features Preview */}
      <div className="space-y-2">
        {monster.special_abilities?.length > 0 && (
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">
              {monster.special_abilities.slice(0, 2).map(a => a.name).join(', ')}
              {monster.special_abilities.length > 2 && ` +${monster.special_abilities.length - 2}`}
            </span>
          </div>
        )}
        {monster.actions?.length > 0 && (
          <div className="flex items-center gap-2">
            <Sword className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">
              {monster.actions.slice(0, 2).map(a => a.name).join(', ')}
              {monster.actions.length > 2 && ` +${monster.actions.length - 2}`}
            </span>
          </div>
        )}
        {monster.legendary_actions?.length > 0 && (
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400/80">Legendary</span>
          </div>
        )}
        {monster.speed && (
          <div className="flex items-center gap-2">
            <Footprints className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-xs text-slate-500 truncate">
              {Object.entries(monster.speed).map(([k, v]) => `${v} ${k}`).slice(0, 3).join(' • ')}
            </span>
          </div>
        )}
      </div>

      {/* Source Tag */}
      {monster.document__title && (
        <div className="absolute bottom-3 right-3">
          <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
            {monster.document__title}
          </span>
        </div>
      )}
    </div>
  );
});

MonsterCard.displayName = 'MonsterCard';

export default MonsterCard;
