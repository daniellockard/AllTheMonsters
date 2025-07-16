import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, Heart, Zap, Crown } from 'lucide-react';

const MonsterModal = ({ monster, onClose }) => {
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

  const getModifier = (score) => {
    if (!score) return '+0';
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
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



  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-dnd-dark border border-dnd-purple/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-dnd-gray/40 border-b border-dnd-purple/20 p-6 z-10 backdrop-blur-sm shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-fantasy text-dnd-gold mb-2">{monster.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`${getTypeColor(monster.type)} font-medium`}>
                    {monster.type}
                  </span>
                  <span className="text-dnd-light/50">•</span>
                  <span className="text-dnd-light/70">{monster.size}</span>
                  {monster.alignment && (
                    <>
                      <span className="text-dnd-light/50">•</span>
                      <span className="text-dnd-light/70">{monster.alignment}</span>
                    </>
                  )}
                  {monster.document__title && (
                    <>
                      <span className="text-dnd-light/50">•</span>
                      <span className={`${getDocumentColor(monster.document__slug)} font-medium`}>
                        {monster.document__title}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`challenge-rating ${getCRClass(monster.challenge_rating)} text-lg`}>
                  CR {monster.challenge_rating || '0'}
                </div>
                <button
                  onClick={onClose}
                  className="text-dnd-light/50 hover:text-dnd-light transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Monster Description */}
            {monster.desc && (
              <div className="bg-dnd-gray/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-fantasy text-dnd-gold mb-4">Description</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm text-dnd-light/90 leading-relaxed whitespace-pre-line">
                    {monster.desc}
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Stats */}
              <div className="lg:col-span-1">
                {/* Armor Class & Hit Points */}
                <div className="bg-dnd-gray/20 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-fantasy text-dnd-gold mb-4">Combat Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-dnd-blue" />
                        <span className="text-dnd-light/70">Armor Class:</span>
                      </div>
                      <span className="font-semibold text-dnd-light">{getAC(monster.armor_class)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-dnd-red" />
                        <span className="text-dnd-light/70">Hit Points:</span>
                      </div>
                      <span className="font-semibold text-dnd-light">{monster.hit_points || 'Unknown'}</span>
                    </div>
                    {monster.hit_dice && (
                      <div className="flex items-center justify-between">
                        <span className="text-dnd-light/70">Hit Dice:</span>
                        <span className="font-semibold text-dnd-light">{monster.hit_dice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed */}
                {monster.speed && (
                  <div className="bg-dnd-gray/20 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-fantasy text-dnd-gold mb-4">Speed</h3>
                    <div className="space-y-2">
                      {Object.entries(monster.speed).map(([type, value]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-dnd-light/70 capitalize">{type}:</span>
                          <span className="font-semibold text-dnd-light">{value} ft.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ability Scores */}
                <div className="bg-dnd-gray/20 rounded-lg p-4">
                  <h3 className="text-lg font-fantasy text-dnd-gold mb-4">Ability Scores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'STR', value: monster.strength, icon: '💪' },
                      { name: 'DEX', value: monster.dexterity, icon: '🏃' },
                      { name: 'CON', value: monster.constitution, icon: '❤️' },
                      { name: 'INT', value: monster.intelligence, icon: '🧠' },
                      { name: 'WIS', value: monster.wisdom, icon: '👁️' },
                      { name: 'CHA', value: monster.charisma, icon: '👑' },
                    ].map(({ name, value, icon }) => (
                      <div key={name} className="text-center">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-sm text-dnd-light/70">{name}</div>
                        <div className="text-lg font-semibold text-dnd-light">{value || '—'}</div>
                        <div className="text-xs text-dnd-light/50">({getModifier(value)})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2">
                {/* Senses & Languages */}
                <div className="bg-dnd-gray/20 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-fantasy text-dnd-gold mb-4">Senses & Languages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-dnd-light/70 mb-2">Senses</h4>
                      <p className="text-sm text-dnd-light">{monster.senses || 'None specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-dnd-light/70 mb-2">Languages</h4>
                      <p className="text-sm text-dnd-light">{monster.languages || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Special Abilities */}
                {monster.special_abilities && monster.special_abilities.length > 0 && (
                  <div className="bg-dnd-gray/20 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-fantasy text-dnd-gold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Special Abilities
                    </h3>
                    <div className="space-y-4">
                      {monster.special_abilities.map((ability, index) => (
                        <div key={index} className="border-l-2 border-dnd-gold/30 pl-4">
                          <h4 className="font-semibold text-dnd-gold mb-1">{ability.name}</h4>
                          <p className="text-sm text-dnd-light/80 leading-relaxed">{ability.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {monster.actions && monster.actions.length > 0 && (
                  <div className="bg-dnd-gray/20 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-fantasy text-dnd-gold mb-4 flex items-center gap-2">
                      <Sword className="w-5 h-5" />
                      Actions
                    </h3>
                    <div className="space-y-4">
                      {monster.actions.map((action, index) => (
                        <div key={index} className="border-l-2 border-dnd-red/30 pl-4">
                          <h4 className="font-semibold text-dnd-red mb-1">{action.name}</h4>
                          <p className="text-sm text-dnd-light/80 leading-relaxed">{action.desc}</p>
                          {action.attack_bonus && (
                            <div className="mt-2 text-xs text-dnd-light/60">
                              Attack Bonus: +{action.attack_bonus}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legendary Actions */}
                {monster.legendary_actions && monster.legendary_actions.length > 0 && (
                  <div className="bg-dnd-gray/20 rounded-lg p-4">
                    <h3 className="text-lg font-fantasy text-dnd-gold mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Legendary Actions
                    </h3>
                    {monster.legendary_desc && (
                      <p className="text-sm text-dnd-light/80 mb-4 italic">{monster.legendary_desc}</p>
                    )}
                    <div className="space-y-4">
                      {monster.legendary_actions.map((action, index) => (
                        <div key={index} className="border-l-2 border-dnd-gold/50 pl-4">
                          <h4 className="font-semibold text-dnd-gold mb-1">{action.name}</h4>
                          <p className="text-sm text-dnd-light/80 leading-relaxed">{action.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MonsterModal; 