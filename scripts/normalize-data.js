import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalization mappings
const typeNormalization = {
  'monstrosity': 'Monstrosity',
  'aberration': 'Aberration',
  'beast': 'Beast',
  'celestial': 'Celestial',
  'construct': 'Construct',
  'dragon': 'Dragon',
  'elemental': 'Elemental',
  'fey': 'Fey',
  'fiend': 'Fiend',
  'giant': 'Giant',
  'humanoid': 'Humanoid',
  'ooze': 'Ooze',
  'plant': 'Plant',
  'swarm': 'Swarm',
  'undead': 'Undead'
};

const sizeNormalization = {
  'tiny': 'Tiny',
  'small': 'Small',
  'medium': 'Medium',
  'large': 'Large',
  'huge': 'Huge',
  'gargantuan': 'Gargantuan',
  'titanic': 'Titanic'
};

const alignmentNormalization = {
  'unaligned': 'Unaligned',
  'neutral evil': 'Neutral Evil',
  'chaotic evil': 'Chaotic Evil',
  'neutral': 'Neutral',
  'lawful evil': 'Lawful Evil',
  'chaotic neutral': 'Chaotic Neutral',
  'neutral good': 'Neutral Good',
  'lawful neutral': 'Lawful Neutral',
  'chaotic good': 'Chaotic Good',
  'lawful good': 'Lawful Good',
  'any alignment': 'Any Alignment',
  'any non-good alignment': 'Any Non-Good Alignment',
  'any evil alignment': 'Any Evil Alignment',
  'any non-lawful alignment': 'Any Non-Lawful Alignment',
  'any alignment (as its creator deity)': 'Any Alignment (as its creator deity)',
  'non-lawful': 'Non-Lawful',
  'neutral good (50%) or neutral evil (50%)': 'Neutral Good (50%) or Neutral Evil (50%)',
  'neutral evil (50%) or lawful evil (50%)': 'Neutral Evil (50%) or Lawful Evil (50%)',
  'neutral evil (50%) lawful evil (50%)': 'Neutral Evil (50%) or Lawful Evil (50%)',
  'lawful neutral or lawful evil': 'Lawful Neutral or Lawful Evil',
  'lawful neutral or evil': 'Lawful Neutral or Evil',
  'good': 'Good',
  'chaotic neutral or chaotic good': 'Chaotic Neutral or Chaotic Good',
  'chaotic neutral or chaotic evil': 'Chaotic Neutral or Chaotic Evil',
  'chaotic good or chaotic neutral': 'Chaotic Good or Chaotic Neutral',
  'chaotic': 'Chaotic',
  'any non-lawful': 'Any Non-Lawful',
  'any non-good': 'Any Non-Good',
  'any lawful alignment': 'Any Lawful Alignment',
  'any good': 'Any Good',
  'any evil': 'Any Evil',
  'any chaotic alignment': 'Any Chaotic Alignment',
  'any chaotic': 'Any Chaotic',
  'any alignment (as its patron deity)': 'Any Alignment (as its patron deity)',
  'any alignment (as its deity)': 'Any Alignment (as its deity)'
};

function normalizeData() {
  console.log('🔧 Starting data normalization...');
  
  // Read the monster data
  const dataPath = path.join(__dirname, '../data/monsters/all-monsters.json');
  const monsters = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log(`📊 Processing ${monsters.length} monsters...`);
  
  let typeChanges = 0;
  let sizeChanges = 0;
  let alignmentChanges = 0;
  
  // Normalize each monster
  monsters.forEach(monster => {
    // Normalize type
    if (monster.type && typeNormalization[monster.type.toLowerCase()]) {
      const normalizedType = typeNormalization[monster.type.toLowerCase()];
      if (monster.type !== normalizedType) {
        console.log(`  Type: "${monster.type}" → "${normalizedType}"`);
        monster.type = normalizedType;
        typeChanges++;
      }
    }
    
    // Normalize size
    if (monster.size) {
      const trimmedSize = monster.size.trim();
      if (sizeNormalization[trimmedSize.toLowerCase()]) {
        const normalizedSize = sizeNormalization[trimmedSize.toLowerCase()];
        if (monster.size !== normalizedSize) {
          console.log(`  Size: "${monster.size}" → "${normalizedSize}"`);
          monster.size = normalizedSize;
          sizeChanges++;
        }
      }
    }
    
    // Normalize alignment
    if (monster.alignment && alignmentNormalization[monster.alignment.toLowerCase()]) {
      const normalizedAlignment = alignmentNormalization[monster.alignment.toLowerCase()];
      if (monster.alignment !== normalizedAlignment) {
        console.log(`  Alignment: "${monster.alignment}" → "${normalizedAlignment}"`);
        monster.alignment = normalizedAlignment;
        alignmentChanges++;
      }
    }
  });
  
  // Save the normalized data
  fs.writeFileSync(dataPath, JSON.stringify(monsters, null, 2));
  
  console.log('\n✅ Normalization complete!');
  console.log(`📊 Changes made:`);
  console.log(`   - Types: ${typeChanges}`);
  console.log(`   - Sizes: ${sizeChanges}`);
  console.log(`   - Alignments: ${alignmentChanges}`);
  console.log(`   - Total: ${typeChanges + sizeChanges + alignmentChanges}`);
  
  // Update individual monster files
  console.log('\n💾 Updating individual monster files...');
  const individualDir = path.join(__dirname, '../data/monsters');
  
  if (!fs.existsSync(individualDir)) {
    fs.mkdirSync(individualDir, { recursive: true });
  }
  
  let savedCount = 0;
  monsters.forEach(monster => {
    const filename = `${monster.slug}.json`;
    const filepath = path.join(individualDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(monster, null, 2));
    savedCount++;
  });
  
  console.log(`✅ Saved ${savedCount} individual monster files`);
  
  // Verify the normalization
  console.log('\n🔍 Verification:');
  const types = [...new Set(monsters.map(m => m.type))].sort();
  const sizes = [...new Set(monsters.map(m => m.size))].sort();
  const alignments = [...new Set(monsters.map(m => m.alignment))].sort();
  
  console.log(`   - Unique types: ${types.length} (${types.join(', ')})`);
  console.log(`   - Unique sizes: ${sizes.length} (${sizes.join(', ')})`);
  console.log(`   - Unique alignments: ${alignments.length}`);
}

normalizeData(); 