import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const MonsterComparison = ({ monsters, onClose }) => {
  const getAC = (ac) => {
    if (Array.isArray(ac)) {
      return ac[0]?.value || ac[0] || 'Unknown';
    }
    return ac || 'Unknown';
  };

  const formatSpeed = (speed) => {
    if (!speed) return '—';
    if (typeof speed === 'string') return speed;
    if (typeof speed === 'object') {
      return Object.entries(speed)
        .map(([type, value]) => `${type}: ${value}`)
        .join(', ');
    }
    return String(speed);
  };

  const highlightDifferences = (values) => {
    const uniqueValues = [...new Set(values.filter(v => v !== null && v !== undefined))];
    const isDifferent = uniqueValues.length > 1;
    return { values, isDifferent };
  };

  const renderTableRow = (label, getValue) => {
    const values = monsters.map(getValue);
    const diff = highlightDifferences(values);
    
    return (
      <tr className="border-b border-dnd-purple/20 hover:bg-dnd-gray/10">
        <td className="py-2 px-2 text-xs font-medium text-dnd-light/70 border-r border-dnd-purple/20">
          {label}
        </td>
        {values.map((value, index) => (
          <td key={index} className={`py-2 px-2 text-xs text-center ${diff.isDifferent ? 'text-dnd-red font-semibold' : 'text-dnd-light'} break-words leading-tight`}>
            {value || '—'}
          </td>
        ))}
      </tr>
    );
  };

  const renderSectionHeader = (title) => (
    <tr className="border-b border-dnd-purple/30">
      <td colSpan={monsters.length + 1} className="py-2 px-2">
        <h3 className="text-sm font-fantasy text-dnd-gold">{title}</h3>
      </td>
    </tr>
  );

  if (monsters.length < 2) return null;

  const firstMonster = monsters[0];

  return (
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
        className="bg-dnd-dark border border-dnd-purple/30 rounded-lg max-w-7xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-dnd-gray/20 border-b border-dnd-purple/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-fantasy text-dnd-gold mb-2">
                Comparing: {firstMonster.name}
              </h2>
              <p className="text-dnd-light/70">
                {monsters.length} variants found
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-dnd-light/50 hover:text-dnd-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Table Header - Sticky */}
        <div className="sticky top-0 bg-dnd-dark border-b border-dnd-purple/30 z-10">
          <div className="p-6 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-dnd-purple/30">
                    <th className="py-2 px-2 text-left text-sm font-fantasy text-dnd-gold border-r border-dnd-purple/20 bg-dnd-dark">
                      Attribute
                    </th>
                    {monsters.map((monster, index) => (
                      <th key={index} className={`py-2 px-2 text-center text-sm font-fantasy text-dnd-gold bg-dnd-dark align-middle ${index < monsters.length - 1 ? 'border-r border-dnd-purple/20' : ''}`}>
                        <div className="text-center leading-tight break-words min-h-[2rem] flex items-center justify-center">
                          Variant {index + 1}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>

        {/* Comparison Table Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Source Information */}
                  {renderTableRow('Source', monster => monster.document__title || 'Unknown')}
                  {renderTableRow('Challenge Rating', monster => monster.challenge_rating)}
                  
                  {/* Basic Info */}
                  {renderSectionHeader('Basic Info')}
                  {renderTableRow('Type', monster => monster.type)}
                  {renderTableRow('Size', monster => monster.size)}
                  {renderTableRow('Alignment', monster => monster.alignment)}
                  {renderTableRow('Armor Class', monster => getAC(monster.armor_class))}
                  {renderTableRow('Hit Points', monster => monster.hit_points)}
                  {renderTableRow('Hit Dice', monster => monster.hit_dice)}

                  {/* Ability Scores */}
                  {renderSectionHeader('Ability Scores')}
                  {renderTableRow('Strength', monster => monster.strength)}
                  {renderTableRow('Dexterity', monster => monster.dexterity)}
                  {renderTableRow('Constitution', monster => monster.constitution)}
                  {renderTableRow('Intelligence', monster => monster.intelligence)}
                  {renderTableRow('Wisdom', monster => monster.wisdom)}
                  {renderTableRow('Charisma', monster => monster.charisma)}

                  {/* Speed */}
                  {monsters.some(m => m.speed) && (
                    <>
                      {renderSectionHeader('Speed')}
                      {renderTableRow('Speed', monster => formatSpeed(monster.speed))}
                    </>
                  )}

                  {/* Special Abilities */}
                  {renderSectionHeader('Special Abilities')}
                  {renderTableRow('Count', monster => monster.special_abilities?.length || 0)}

                  {/* Actions */}
                  {renderSectionHeader('Actions')}
                  {renderTableRow('Count', monster => monster.actions?.length || 0)}

                  {/* Legendary Actions */}
                  {renderSectionHeader('Legendary Actions')}
                  {renderTableRow('Count', monster => monster.legendary_actions?.length || 0)}

                  {/* Legendary Resistance */}
                  {renderSectionHeader('Legendary Resistance')}
                  {renderTableRow('Uses', monster => 
                    monster.legendary_actions?.find(a => a.name?.includes('Legendary Resistance'))?.desc || 'None'
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-dnd-gray/20 rounded-lg border border-dnd-purple/20">
              <h4 className="text-sm font-semibold text-dnd-gold mb-3">Legend</h4>
              <div className="text-xs text-dnd-light/70 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-dnd-red rounded-full"></div>
                  <span className="text-dnd-red font-semibold">Red text</span> indicates differences between variants
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-dnd-light rounded-full"></div>
                  <span className="text-dnd-light">Normal text</span> indicates identical values
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-dnd-light/50 rounded-full"></div>
                  <span className="text-dnd-light/50">—</span> indicates missing data
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MonsterComparison; 