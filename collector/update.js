import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

const OPEN5E_API_BASE = 'https://api.open5e.com';
const OUTPUT_DIR = './data/monsters';
const HASH_FILE = './data/monsters.hashes.json';

// Sanitize filenames to be cross-platform safe
const sanitizeFilename = (name) => {
  return name
    .replace(/:/g, '-')
    .replace(/[\/\\]/g, '-')  // Replace slashes
    .replace(/[<>"\|\?\*,]/g, '-')  // Other unsafe chars
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
};

// Format monster as JSON string (consistent formatting)
const formatMonster = (monster) => {
  return JSON.stringify(monster, null, 2);
};

// Create a content hash for a monster's JSON representation
const hashContent = (content) => {
  return crypto.createHash('md5').update(content).digest('hex');
};

// Configuration
const CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  requestDelay: 100,
  pageSize: 1000
};

class MonsterUpdater {
  constructor() {
    // hashes now stores { slug: { hash, filename } }
    this.hashes = {};
    this.stats = {
      total: 0,
      unchanged: 0,
      updated: 0,
      added: 0,
      removed: 0,
      errors: 0
    };
    this.startTime = Date.now();
  }

  async loadHashes() {
    try {
      if (await fs.pathExists(HASH_FILE)) {
        const data = await fs.readJson(HASH_FILE);
        // Handle old format (just hash string) vs new format (object with hash + filename)
        for (const [slug, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            // Old format - we'll need to rebuild
            console.log('📂 Old hash format detected, rebuilding...');
            await this.buildHashesFromFiles();
            return;
          }
        }
        this.hashes = data;
        console.log(`📂 Loaded ${Object.keys(this.hashes).length} existing hashes`);
      } else {
        console.log('📂 No existing hashes found, will create fresh');
        await this.buildHashesFromFiles();
      }
    } catch (error) {
      console.log('⚠️  Could not load hashes, rebuilding from files...');
      await this.buildHashesFromFiles();
    }
  }

  async buildHashesFromFiles() {
    if (!(await fs.pathExists(OUTPUT_DIR))) {
      this.hashes = {};
      return;
    }

    const files = await fs.readdir(OUTPUT_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`🔨 Building hashes from ${jsonFiles.length} existing files...`);
    
    for (const file of jsonFiles) {
      try {
        const filepath = path.join(OUTPUT_DIR, file);
        const content = await fs.readFile(filepath, 'utf8');
        const monster = JSON.parse(content);
        if (monster.slug) {
          this.hashes[monster.slug] = {
            hash: hashContent(content),
            filename: file
          };
        }
      } catch (e) {
        // Skip invalid files
      }
    }
    
    console.log(`✅ Built ${Object.keys(this.hashes).length} hashes`);
  }

  async saveHashes() {
    await fs.ensureDir(path.dirname(HASH_FILE));
    await fs.writeJson(HASH_FILE, this.hashes, { spaces: 2 });
    console.log(`💾 Saved ${Object.keys(this.hashes).length} hashes`);
  }

  async makeRequest(url, retries = CONFIG.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, { timeout: CONFIG.timeout });
        return response;
      } catch (error) {
        if (attempt === retries) throw error;
        const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(`  ⚠️  Retry ${attempt}/${retries} after ${delay}ms...`);
        await this.delay(delay);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchAllSlugs() {
    console.log('\n🔍 Fetching monster list from API...');
    const slugs = new Set();
    let url = `${OPEN5E_API_BASE}/monsters/?limit=${CONFIG.pageSize}&fields=slug`;
    let page = 1;

    while (url) {
      const response = await this.makeRequest(url);
      const data = response.data;
      
      for (const monster of data.results) {
        slugs.add(monster.slug);
      }
      
      console.log(`  📄 Page ${page}: ${data.results.length} monsters (${slugs.size} total)`);
      url = data.next;
      page++;
      
      if (url) await this.delay(CONFIG.requestDelay);
    }

    this.stats.total = slugs.size;
    return slugs;
  }

  async checkAndUpdateMonster(slug) {
    try {
      const response = await this.makeRequest(`${OPEN5E_API_BASE}/monsters/${slug}/`);
      const monster = response.data;
      
      // Format the new content exactly as we'd write it
      const newContent = formatMonster(monster);
      const newHash = hashContent(newContent);
      const existing = this.hashes[slug];
      const oldHash = existing?.hash;

      if (oldHash === newHash) {
        this.stats.unchanged++;
        return { slug, status: 'unchanged' };
      }

      // Save the updated monster
      const filename = `${sanitizeFilename(monster.name)}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      // If filename changed (e.g., monster renamed), delete old file
      if (existing?.filename && existing.filename !== filename) {
        const oldPath = path.join(OUTPUT_DIR, existing.filename);
        if (await fs.pathExists(oldPath)) {
          await fs.remove(oldPath);
        }
      }
      
      // Write exactly what we hashed (no trailing newline surprises)
      await fs.writeFile(filepath, newContent, 'utf8');
      
      // Update hash with filename
      this.hashes[slug] = { hash: newHash, filename };

      if (oldHash) {
        this.stats.updated++;
        return { slug, status: 'updated', name: monster.name };
      } else {
        this.stats.added++;
        return { slug, status: 'added', name: monster.name };
      }
    } catch (error) {
      this.stats.errors++;
      return { slug, status: 'error', error: error.message };
    }
  }

  async removeMonster(slug) {
    const existing = this.hashes[slug];
    if (existing?.filename) {
      const filepath = path.join(OUTPUT_DIR, existing.filename);
      if (await fs.pathExists(filepath)) {
        await fs.remove(filepath);
        return true;
      }
    }
    return false;
  }

  async update() {
    console.log('🐉 Monster Incremental Updater\n');
    console.log('='.repeat(50));

    // Load existing hashes
    await this.loadHashes();
    const existingSlugs = new Set(Object.keys(this.hashes));

    // Fetch current slugs from API
    const currentSlugs = await this.fetchAllSlugs();

    // Check all monsters for changes
    console.log('\n🔄 Checking for changes...');
    
    const changes = [];
    let checked = 0;

    for (const slug of currentSlugs) {
      checked++;
      
      // Show progress every 100 monsters
      if (checked % 100 === 0 || checked === currentSlugs.size) {
        process.stdout.write(`\r  Checking: ${checked}/${currentSlugs.size}`);
      }

      const result = await this.checkAndUpdateMonster(slug);
      
      if (result.status !== 'unchanged') {
        changes.push(result);
      }

      await this.delay(CONFIG.requestDelay);
    }

    console.log('\n');

    // Check for removed monsters and delete their files
    const removedSlugs = [...existingSlugs].filter(s => !currentSlugs.has(s));
    for (const slug of removedSlugs) {
      const deleted = await this.removeMonster(slug);
      const existing = this.hashes[slug];
      console.log(`  🗑️  Removed: ${existing?.filename || slug}${deleted ? ' (file deleted)' : ''}`);
      delete this.hashes[slug];
      this.stats.removed++;
      changes.push({ slug, status: 'removed', name: existing?.filename });
    }

    // Save updated hashes
    await this.saveHashes();

    // Print summary
    this.printSummary(changes);
  }

  printSummary(changes) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Update Summary\n');
    console.log(`  Total monsters:  ${this.stats.total}`);
    console.log(`  Unchanged:       ${this.stats.unchanged}`);
    console.log(`  Added:           ${this.stats.added}`);
    console.log(`  Updated:         ${this.stats.updated}`);
    console.log(`  Removed:         ${this.stats.removed}`);
    console.log(`  Errors:          ${this.stats.errors}`);
    console.log(`\n  Time elapsed:    ${elapsed}s`);

    if (changes.length > 0) {
      console.log('\n📝 Changes:');
      for (const change of changes.slice(0, 20)) {
        const icon = change.status === 'added' ? '➕' : 
                     change.status === 'updated' ? '📝' :
                     change.status === 'removed' ? '🗑️' : '❌';
        console.log(`  ${icon} ${change.status}: ${change.name || change.slug}`);
      }
      if (changes.length > 20) {
        console.log(`  ... and ${changes.length - 20} more`);
      }
    } else {
      console.log('\n✨ Everything is up to date!');
    }
  }
}

// Run the updater
const updater = new MonsterUpdater();
updater.update().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
