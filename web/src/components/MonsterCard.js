import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Heart, Zap, Crown, GitCompare } from 'lucide-react';

const MonsterCard = ({ monster, onClick, onCompare, hasDuplicates }) => {
  const getCRClass = (cr) => {
    if (!cr) return 'cr-0';
    const crNum = parseFloat(cr);
    if (crNum === 0) return 'cr-0';
    if (crNum <= 0.125) return 'cr-1-8';
    if (crNum <= 0.25) return 'cr-1-4';
    if (crNum <= 0.5) return 'cr-1-2';
    if (crNum <= 1) return 'cr-1';
    if (crNum <= 2) return 'cr-2';
    if (crNum <= 3) return 'cr-3';
    if (crNum <= 4) return 'cr-4';
    if (crNum <= 5) return 'cr-5';
    if (crNum <= 6) return 'cr-6';
    if (crNum <= 7) return 'cr-7';
    if (crNum <= 8) return 'cr-8';
    if (crNum <= 9) return 'cr-9';
    if (crNum <= 10) return 'cr-10';
    if (crNum <= 11) return 'cr-11';
    if (crNum <= 12) return 'cr-12';
    if (crNum <= 13) return 'cr-13';
    if (crNum <= 14) return 'cr-14';
    if (crNum <= 15) return 'cr-15';
    if (crNum <= 16) return 'cr-16';
    if (crNum <= 17) return 'cr-17';
    if (crNum <= 18) return 'cr-18';
    if (crNum <= 19) return 'cr-19';
    if (crNum <= 20) return 'cr-20';
    if (crNum <= 21) return 'cr-21';
    if (crNum <= 22) return 'cr-22';
    if (crNum <= 23) return 'cr-23';
    if (crNum <= 24) return 'cr-24';
    if (crNum <= 25) return 'cr-25';
    if (crNum <= 26) return 'cr-26';
    if (crNum <= 27) return 'cr-27';
    if (crNum <= 28) return 'cr-28';
    if (crNum <= 29) return 'cr-29';
    return 'cr-30';
  };

  const getAC = (ac) => {
    if (Array.isArray(ac)) {
      return ac[0]?.value || ac[0] || 'Unknown';
    }
    return ac || 'Unknown';
  };

  const getSizeIcon = (size) => {
    switch (size?.toLowerCase()) {
      case 'tiny': return '🦋';
      case 'small': return '🐭';
      case 'medium': return '👤';
      case 'large': return '🐻';
      case 'huge': return '🐘';
      case 'gargantuan': return '🐋';
      default: return '❓';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'aberration': return 'text-purple-400';
      case 'beast': return 'text-green-400';
      case 'celestial': return 'text-yellow-400';
      case 'construct': return 'text-gray-400';
      case 'dragon': return 'text-red-400';
      case 'elemental': return 'text-blue-400';
      case 'fey': return 'text-pink-400';
      case 'fiend': return 'text-red-600';
      case 'giant': return 'text-orange-400';
      case 'humanoid': return 'text-blue-300';
      case 'monstrosity': return 'text-purple-300';
      case 'ooze': return 'text-green-300';
      case 'plant': return 'text-green-500';
      case 'swarm': return 'text-yellow-300';
      case 'undead': return 'text-gray-300';
      default: return 'text-gray-300';
    }
  };

  const getDocumentColor = (documentSlug) => {
    switch (documentSlug) {
      case 'wotc-srd': return 'text-blue-400';
      case 'menagerie': return 'text-green-400';
      case 'tob': return 'text-purple-400';
      case 'tob2': return 'text-purple-500';
      case 'tob3': return 'text-purple-600';
      case 'tob-2023': return 'text-purple-700';
      case 'blackflag': return 'text-red-400';
      case 'cc': return 'text-orange-400';
      case 'taldorei': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };



  const getModifier = (score) => {
    if (!score) return '+0';
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="monster-card cursor-pointer relative"
      onClick={onClick}
    >
      {/* Comparison Button */}
      {hasDuplicates && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare(monster);
          }}
          className="absolute top-2 right-2 p-1 bg-dnd-purple/20 hover:bg-dnd-purple/40 rounded-full transition-colors z-10"
          title="Compare variants"
        >
          <GitCompare className="w-4 h-4 text-dnd-gold" />
        </button>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div className="flex-1 min-w-0 text-center">
          <h3 className="font-fantasy text-lg font-semibold text-dnd-gold mb-1 truncate">
            {monster.name}
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={`${getTypeColor(monster.type)} font-medium truncate`}>
              {monster.type}
            </span>
            <span className="text-dnd-light/50 flex-shrink-0">•</span>
            <span className="text-dnd-light/70 flex items-center gap-1 flex-shrink-0">
              {getSizeIcon(monster.size)} {monster.size}
            </span>
            {monster.document__title && (
              <>
                <span className="text-dnd-light/50 flex-shrink-0">•</span>
                <span className={`${getDocumentColor(monster.document__slug)} text-xs font-medium`}>
                  {monster.document__title}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={`challenge-rating ${getCRClass(monster.challenge_rating)} flex-shrink-0 ml-2`}>
          CR {monster.challenge_rating || '0'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-dnd-blue flex-shrink-0" />
          <span className="text-sm text-dnd-light/70">AC:</span>
          <span className="text-sm font-semibold text-dnd-light">
            {getAC(monster.armor_class)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-dnd-red flex-shrink-0" />
          <span className="text-sm text-dnd-light/70">HP:</span>
          <span className="text-sm font-semibold text-dnd-light">
            {monster.hit_points || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Ability Scores Grid */}
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-xs font-semibold text-dnd-light/70 mb-2 text-center">Ability Scores</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { name: 'STR', value: monster.strength, color: 'text-red-400' },
            { name: 'DEX', value: monster.dexterity, color: 'text-green-400' },
            { name: 'CON', value: monster.constitution, color: 'text-yellow-400' },
            { name: 'INT', value: monster.intelligence, color: 'text-blue-400' },
            { name: 'WIS', value: monster.wisdom, color: 'text-purple-400' },
            { name: 'CHA', value: monster.charisma, color: 'text-pink-400' },
          ].map(({ name, value, color }) => (
            <div key={name} className="text-center">
              <div className={`font-semibold ${color}`}>{name}</div>
              <div className="text-dnd-light font-bold">{value || '—'}</div>
              <div className="text-dnd-light/50 text-xs">({getModifier(value)})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Abilities Preview */}
      {monster.special_abilities && monster.special_abilities.length > 0 && (
        <div className="mb-3 pt-3 border-t border-dnd-purple/20 flex-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-dnd-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-dnd-gold">Special Abilities</span>
          </div>
          <div className="text-xs text-dnd-light/70 space-y-1 text-center">
            {monster.special_abilities.slice(0, 2).map((ability, index) => (
              <div key={index} className="truncate">
                {ability.name}
              </div>
            ))}
            {monster.special_abilities.length > 2 && (
              <div className="text-dnd-gold/70">+{monster.special_abilities.length - 2} more</div>
            )}
          </div>
        </div>
      )}

      {/* Actions Preview */}
      {monster.actions && monster.actions.length > 0 && (
        <div className="mb-3 pt-3 border-t border-dnd-purple/20 flex-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sword className="w-4 h-4 text-dnd-red flex-shrink-0" />
            <span className="text-xs font-semibold text-dnd-red">Actions</span>
          </div>
          <div className="text-xs text-dnd-light/70 space-y-1 text-center">
            {monster.actions.slice(0, 2).map((action, index) => (
              <div key={index} className="truncate">
                {action.name}
              </div>
            ))}
            {monster.actions.length > 2 && (
              <div className="text-dnd-red/70">+{monster.actions.length - 2} more</div>
            )}
          </div>
        </div>
      )}

      {/* Legendary Actions */}
      {monster.legendary_actions && monster.legendary_actions.length > 0 && (
        <div className="pt-3 border-t border-dnd-purple/20 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-dnd-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-dnd-gold">Legendary Actions</span>
          </div>
        </div>
      )}
      
      {/* Spacer for cards without special abilities or actions */}
      {(!monster.special_abilities || monster.special_abilities.length === 0) && 
       (!monster.actions || monster.actions.length === 0) && (
        <div className="flex-1"></div>
      )}
    </motion.div>
  );
};

export default MonsterCard; 