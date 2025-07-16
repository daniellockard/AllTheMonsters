import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

const OPEN5E_API_BASE = 'https://api.open5e.com';
const OUTPUT_DIR = './data/monsters';

// Configuration
const CONFIG = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  maxRetryDelay: 30000, // 30 seconds max delay
  requestDelay: 200, // 200ms between requests
  batchSize: 50, // Process in smaller batches
  saveInterval: 100 // Save progress every 100 monsters
};

class MonsterCollector {
  constructor() {
    this.monsters = [];
    this.errors = [];
    this.totalMonsters = 0;
    this.processedCount = 0;
    this.successfulCount = 0;
    this.failedCount = 0;
    this.startTime = Date.now();
  }

  async fetchAllMonsters() {
    console.log('🔍 Fetching all monsters from Open5e API...');
    
    try {
      // First, get the total count and first page
      const initialResponse = await this.makeRequest(`${OPEN5E_API_BASE}/monsters/?limit=1000`);
      
      if (initialResponse.data && initialResponse.data.results) {
        this.totalMonsters = initialResponse.data.count;
        console.log(`📊 Found ${this.totalMonsters} total monsters`);
        console.log(`📄 First page contains ${initialResponse.data.results.length} monsters`);
        
        // Process the first batch
        await this.processMonsterBatch(initialResponse.data.results);
        
        // If there are more pages, fetch them
        if (initialResponse.data.next) {
          await this.fetchRemainingPages(initialResponse.data.next);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching monster list:', error.message);
      throw error;
    }
  }

  async fetchRemainingPages(nextUrl) {
    let currentUrl = nextUrl;
    let pageCount = 2;
    
    while (currentUrl) {
      try {
        console.log(`📄 Fetching page ${pageCount}...`);
        const response = await this.makeRequest(currentUrl);
        
        if (response.data && response.data.results) {
          console.log(`📄 Page ${pageCount} contains ${response.data.results.length} monsters`);
          await this.processMonsterBatch(response.data.results);
          currentUrl = response.data.next;
          pageCount++;
        } else {
          break;
        }
      } catch (error) {
        console.error(`❌ Error fetching page ${pageCount}:`, error.message);
        this.errors.push({
          page: pageCount,
          url: currentUrl,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Try to continue with next page if possible
        if (currentUrl.includes('page=')) {
          const pageMatch = currentUrl.match(/page=(\d+)/);
          if (pageMatch) {
            const currentPage = parseInt(pageMatch[1]);
            currentUrl = currentUrl.replace(/page=\d+/, `page=${currentPage + 1}`);
            console.log(`🔄 Attempting to continue with page ${currentPage + 1}...`);
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
  }

  async processMonsterBatch(monsterList) {
    console.log(`🔄 Processing batch of ${monsterList.length} monsters...`);
    
    for (let i = 0; i < monsterList.length; i++) {
      const monster = monsterList[i];
      this.processedCount++;
      
      console.log(`Processing ${this.processedCount}/${this.totalMonsters}: ${monster.name}`);
      
      try {
        // Fetch detailed monster data
        const detailedResponse = await this.makeRequest(`${OPEN5E_API_BASE}/monsters/${monster.slug}/`);
        this.monsters.push(detailedResponse.data);
        this.successfulCount++;
        
        // Save progress periodically
        if (this.successfulCount % CONFIG.saveInterval === 0) {
          await this.saveProgress();
        }
        
        // Add delay between requests
        await this.sleep(CONFIG.requestDelay);
      } catch (error) {
        console.error(`❌ Error fetching ${monster.name}:`, error.message);
        this.failedCount++;
        this.errors.push({
          name: monster.name,
          slug: monster.slug,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      // Show progress every 50 monsters
      if (this.processedCount % 50 === 0) {
        this.showProgress();
      }
    }
  }

  async makeRequest(url, retryCount = 0) {
    try {
      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          'User-Agent': 'AllTheMonsters-Collector/1.0'
        }
      });
      return response;
    } catch (error) {
      if (retryCount < CONFIG.maxRetries) {
        const delay = Math.min(
          CONFIG.retryDelay * Math.pow(2, retryCount),
          CONFIG.maxRetryDelay
        );
        
        console.log(`⚠️  Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
        await this.sleep(delay);
        return this.makeRequest(url, retryCount + 1);
      } else {
        throw error;
      }
    }
  }

  async saveProgress() {
    try {
      const progressPath = path.join(OUTPUT_DIR, 'progress.json');
      const progress = {
        processedCount: this.processedCount,
        successfulCount: this.successfulCount,
        failedCount: this.failedCount,
        totalMonsters: this.totalMonsters,
        timestamp: new Date().toISOString(),
        elapsedTime: Date.now() - this.startTime
      };
      await fs.writeJson(progressPath, progress, { spaces: 2 });
    } catch (error) {
      console.error('⚠️  Could not save progress:', error.message);
    }
  }

  showProgress() {
    const elapsed = Date.now() - this.startTime;
    const elapsedMinutes = Math.floor(elapsed / 60000);
    const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
    
    const successRate = this.processedCount > 0 ? 
      ((this.successfulCount / this.processedCount) * 100).toFixed(1) : 0;
    
    console.log(`📊 Progress: ${this.processedCount}/${this.totalMonsters} (${successRate}% success) - ${elapsedMinutes}m ${elapsedSeconds}s elapsed`);
  }

  async saveMonsters() {
    console.log('💾 Saving monster data...');
    
    // Ensure output directory exists
    await fs.ensureDir(OUTPUT_DIR);
    
    // Save all monsters to a single file
    const allMonstersPath = path.join(OUTPUT_DIR, 'all-monsters.json');
    await fs.writeJson(allMonstersPath, this.monsters, { spaces: 2 });
    console.log(`✅ Saved ${this.monsters.length} monsters to ${allMonstersPath}`);
    
    // Save individual monster files
    console.log('💾 Saving individual monster files...');
    for (const monster of this.monsters) {
      const filename = `${monster.slug || monster.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      await fs.writeJson(filepath, monster, { spaces: 2 });
    }
    console.log(`✅ Saved individual monster files to ${OUTPUT_DIR}/`);
    
    // Save errors if any
    if (this.errors.length > 0) {
      const errorsPath = path.join(OUTPUT_DIR, 'errors.json');
      await fs.writeJson(errorsPath, this.errors, { spaces: 2 });
      console.log(`⚠️  Saved ${this.errors.length} errors to ${errorsPath}`);
    }
    
    // Create a summary file
    const summary = {
      totalMonsters: this.monsters.length,
      totalErrors: this.errors.length,
      totalProcessed: this.processedCount,
      totalSuccessful: this.successfulCount,
      totalFailed: this.failedCount,
      timestamp: new Date().toISOString(),
      elapsedTime: Date.now() - this.startTime,
      monsters: this.monsters.map(m => ({
        name: m.name,
        slug: m.slug,
        challenge_rating: m.challenge_rating,
        type: m.type,
        size: m.size
      }))
    };
    
    const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    console.log(`📋 Saved summary to ${summaryPath}`);
  }

  async generateStats() {
    console.log('📈 Generating statistics...');
    
    const stats = {
      totalMonsters: this.monsters.length,
      byChallengeRating: {},
      byType: {},
      bySize: {},
      averageStats: {
        armor_class: 0,
        hit_points: 0,
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      }
    };
    
    let totalAC = 0, totalHP = 0, totalStr = 0, totalDex = 0, totalCon = 0, totalInt = 0, totalWis = 0, totalCha = 0;
    let statCount = 0;
    
    for (const monster of this.monsters) {
      // Challenge Rating
      const cr = monster.challenge_rating || 'Unknown';
      stats.byChallengeRating[cr] = (stats.byChallengeRating[cr] || 0) + 1;
      
      // Type
      const type = monster.type || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Size
      const size = monster.size || 'Unknown';
      stats.bySize[size] = (stats.bySize[size] || 0) + 1;
      
      // Average stats
      if (monster.armor_class) {
        const ac = Array.isArray(monster.armor_class) ? monster.armor_class[0].value : monster.armor_class;
        if (typeof ac === 'number') {
          totalAC += ac;
          statCount++;
        }
      }
      
      if (monster.hit_points) {
        totalHP += monster.hit_points;
      }
      
      if (monster.strength) totalStr += monster.strength;
      if (monster.dexterity) totalDex += monster.dexterity;
      if (monster.constitution) totalCon += monster.constitution;
      if (monster.intelligence) totalInt += monster.intelligence;
      if (monster.wisdom) totalWis += monster.wisdom;
      if (monster.charisma) totalCha += monster.charisma;
    }
    
    if (statCount > 0) {
      stats.averageStats.armor_class = Math.round(totalAC / statCount);
    }
    stats.averageStats.hit_points = Math.round(totalHP / this.monsters.length);
    stats.averageStats.strength = Math.round(totalStr / this.monsters.length);
    stats.averageStats.dexterity = Math.round(totalDex / this.monsters.length);
    stats.averageStats.constitution = Math.round(totalCon / this.monsters.length);
    stats.averageStats.intelligence = Math.round(totalInt / this.monsters.length);
    stats.averageStats.wisdom = Math.round(totalWis / this.monsters.length);
    stats.averageStats.charisma = Math.round(totalCha / this.monsters.length);
    
    const statsPath = path.join(OUTPUT_DIR, 'statistics.json');
    await fs.writeJson(statsPath, stats, { spaces: 2 });
    console.log(`📊 Saved statistics to ${statsPath}`);
    
    return stats;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    console.log('🐉 Starting D&D 5.1 SRD Monster Collection...\n');
    console.log(`⚙️  Configuration:`);
    console.log(`   - Timeout: ${CONFIG.timeout}ms`);
    console.log(`   - Max retries: ${CONFIG.maxRetries}`);
    console.log(`   - Request delay: ${CONFIG.requestDelay}ms`);
    console.log(`   - Save interval: ${CONFIG.saveInterval} monsters\n`);
    
    try {
      await this.fetchAllMonsters();
      await this.saveMonsters();
      await this.generateStats();
      
      const totalTime = Date.now() - this.startTime;
      const totalMinutes = Math.floor(totalTime / 60000);
      const totalSeconds = Math.floor((totalTime % 60000) / 1000);
      
      console.log('\n🎉 Monster collection completed successfully!');
      console.log(`📁 Data saved to: ${OUTPUT_DIR}`);
      console.log(`📊 Total monsters collected: ${this.monsters.length}`);
      console.log(`📊 Total monsters available: ${this.totalMonsters}`);
      console.log(`📊 Success rate: ${((this.successfulCount / this.processedCount) * 100).toFixed(1)}%`);
      console.log(`⏱️  Total time: ${totalMinutes}m ${totalSeconds}s`);
      if (this.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${this.errors.length}`);
      }
    } catch (error) {
      console.error('❌ Collection failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the collector
const collector = new MonsterCollector();
collector.run(); 