import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Heart, Zap, Sword, Crown, Eye, MessageSquare, Footprints, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const typeColors = {
  aberration: 'from-purple-500 to-indigo-600',
  beast: 'from-emerald-500 to-green-600',
  celestial: 'from-amber-400 to-yellow-500',
  construct: 'from-slate-400 to-zinc-500',
  dragon: 'from-red-500 to-orange-600',
  elemental: 'from-cyan-400 to-blue-500',
  fey: 'from-pink-400 to-fuchsia-500',
  fiend: 'from-red-600 to-rose-700',
  giant: 'from-orange-500 to-amber-600',
  humanoid: 'from-blue-400 to-indigo-500',
  monstrosity: 'from-violet-500 to-purple-600',
  ooze: 'from-lime-400 to-green-500',
  plant: 'from-green-500 to-emerald-600',
  swarm: 'from-yellow-400 to-amber-500',
  undead: 'from-gray-500 to-slate-600',
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

const getCRColor = (cr) => {
  const num = parseFloat(cr) || 0;
  if (num <= 1) return 'bg-emerald-500 text-white';
  if (num <= 4) return 'bg-yellow-500 text-black';
  if (num <= 10) return 'bg-orange-500 text-white';
  if (num <= 17) return 'bg-red-500 text-white';
  if (num <= 24) return 'bg-purple-500 text-white';
  return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white';
};

const Section = ({ icon: Icon, title, children, color = 'text-white' }) => (
  <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm border border-white/5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <h3 className={`font-semibold ${color}`}>{title}</h3>
    </div>
    {children}
  </div>
);

const AbilityBlock = ({ ability, borderColor = 'border-violet-500/30' }) => (
  <div className={`border-l-2 ${borderColor} pl-4 py-1`}>
    <h4 className="font-semibold text-white mb-1">{ability.name}</h4>
    <ReactMarkdown
      className="text-sm text-slate-300 leading-relaxed prose-sm"
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
        em: ({ children }) => <em className="text-slate-400">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
        li: ({ children }) => <li className="text-slate-300">{children}</li>,
      }}
    >
      {ability.desc}
    </ReactMarkdown>
    {ability.attack_bonus && (
      <div className="mt-2 text-xs text-slate-500">Attack: +{ability.attack_bonus}</div>
    )}
  </div>
);

const MonsterModal = ({ monster, onClose }) => {
  const typeLower = monster.type?.toLowerCase() || 'humanoid';
  const headerGradient = typeColors[typeLower] || typeColors.humanoid;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerGradient} p-6 relative overflow-hidden`}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/20" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/20" />
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{monster.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                <span className="font-medium">{monster.size} {monster.type}</span>
                {monster.alignment && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <span>{monster.alignment}</span>
                  </>
                )}
                {monster.document__title && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {monster.document__title}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-lg font-bold ${getCRColor(monster.challenge_rating)}`}>
                CR {monster.challenge_rating || '0'}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Description */}
          {monster.desc && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <h3 className="font-semibold text-violet-400">Description</h3>
              </div>
              <ReactMarkdown
                className="text-slate-300 leading-relaxed"
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="text-white">{children}</strong>,
                }}
              >
                {monster.desc}
              </ReactMarkdown>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Combat Stats */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold text-white mb-4">Combat</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Armor Class</span>
                  </div>
                  <span className="font-semibold text-white">{getAC(monster.armor_class)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>Hit Points</span>
                  </div>
                  <span className="font-semibold text-white">
                    {monster.hit_points} {monster.hit_dice && <span className="text-slate-500 font-normal">({monster.hit_dice})</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Speed */}
            {monster.speed && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Speed</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(monster.speed).map(([type, value]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{type}</span>
                      <span className="font-semibold text-white">{value} ft.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Senses & Languages */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Senses</span>
                  </div>
                  <p className="text-white text-sm">{monster.senses || 'None'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">Languages</span>
                  </div>
                  <p className="text-white text-sm">{monster.languages || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <h3 className="font-semibold text-white mb-4">Ability Scores</h3>
            <div className="grid grid-cols-6 gap-3">
              {[
                { key: 'STR', val: monster.strength, color: 'text-red-400', emoji: '💪' },
                { key: 'DEX', val: monster.dexterity, color: 'text-green-400', emoji: '🏃' },
                { key: 'CON', val: monster.constitution, color: 'text-orange-400', emoji: '❤️' },
                { key: 'INT', val: monster.intelligence, color: 'text-blue-400', emoji: '🧠' },
                { key: 'WIS', val: monster.wisdom, color: 'text-purple-400', emoji: '👁️' },
                { key: 'CHA', val: monster.charisma, color: 'text-pink-400', emoji: '👑' },
              ].map(({ key, val, color, emoji }) => (
                <div key={key} className="text-center bg-slate-800/50 rounded-xl py-3 px-2">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className={`text-xs font-medium ${color} mb-1`}>{key}</div>
                  <div className="text-xl font-bold text-white">{val || '—'}</div>
                  <div className="text-sm text-slate-500">{getModifier(val)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Abilities */}
          {monster.special_abilities?.length > 0 && (
            <Section icon={Zap} title="Special Abilities" color="text-amber-400">
              <div className="space-y-4">
                {monster.special_abilities.map((ability, i) => (
                  <AbilityBlock key={i} ability={ability} borderColor="border-amber-500/30" />
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
          {monster.actions?.length > 0 && (
            <Section icon={Sword} title="Actions" color="text-red-400">
              <div className="space-y-4">
                {monster.actions.map((action, i) => (
                  <AbilityBlock key={i} ability={action} borderColor="border-red-500/30" />
                ))}
              </div>
            </Section>
          )}

          {/* Bonus Actions */}
          {monster.bonus_actions?.length > 0 && (
            <Section icon={Zap} title="Bonus Actions" color="text-emerald-400">
              <div className="space-y-4">
                {monster.bonus_actions.map((action, i) => (
                  <AbilityBlock key={i} ability={action} borderColor="border-emerald-500/30" />
                ))}
              </div>
            </Section>
          )}

          {/* Reactions */}
          {monster.reactions?.length > 0 && (
            <Section icon={Shield} title="Reactions" color="text-blue-400">
              <div className="space-y-4">
                {monster.reactions.map((reaction, i) => (
                  <AbilityBlock key={i} ability={reaction} borderColor="border-blue-500/30" />
                ))}
              </div>
            </Section>
          )}

          {/* Legendary Actions */}
          {monster.legendary_actions?.length > 0 && (
            <Section icon={Crown} title="Legendary Actions" color="text-amber-400">
              {monster.legendary_desc && (
                <p className="text-slate-400 text-sm italic mb-4">{monster.legendary_desc}</p>
              )}
              <div className="space-y-4">
                {monster.legendary_actions.map((action, i) => (
                  <AbilityBlock key={i} ability={action} borderColor="border-amber-500/50" />
                ))}
              </div>
            </Section>
          )}

          {/* Lair Actions */}
          {monster.lair_actions?.length > 0 && (
            <Section icon={Crown} title="Lair Actions" color="text-violet-400">
              <div className="space-y-4">
                {monster.lair_actions.map((action, i) => (
                  <AbilityBlock key={i} ability={action} borderColor="border-violet-500/30" />
                ))}
              </div>
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MonsterModal;
