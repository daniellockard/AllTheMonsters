import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

const OPEN5E_API_BASE = 'https://api.open5e.com';
const OUTPUT_DIR = './data/monsters';

// Configuration
const CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  maxRetryDelay: 30000,
  requestDelay: 200,
  saveInterval: 100
};

class MonsterResumer {
  constructor() {
    this.monsters = [];
    this.errors = [];
    this.processedCount = 0;
    this.successfulCount = 0;
    this.failedCount = 0;
    this.startTime = Date.now();
    this.existingMonsters = new Set();
  }

  async loadExistingData() {
    console.log('📂 Loading existing data...');
    
    try {
      // Load existing monsters
      const allMonstersPath = path.join(OUTPUT_DIR, 'all-monsters.json');
      if (await fs.pathExists(allMonstersPath)) {
        const existingData = await fs.readJson(allMonstersPath);
        this.monsters = existingData;
        this.successfulCount = existingData.length;
        
        // Create set of existing monster slugs
        for (const monster of existingData) {
          this.existingMonsters.add(monster.slug);
        }
        
        console.log(`✅ Loaded ${this.monsters.length} existing monsters`);
      }
      
      // Load existing errors
      const errorsPath = path.join(OUTPUT_DIR, 'errors.json');
      if (await fs.pathExists(errorsPath)) {
        const existingErrors = await fs.readJson(errorsPath);
        this.errors = existingErrors;
        console.log(`⚠️  Loaded ${this.errors.length} existing errors`);
      }
      
      // Load progress
      const progressPath = path.join(OUTPUT_DIR, 'progress.json');
      if (await fs.pathExists(progressPath)) {
        const progress = await fs.readJson(progressPath);
        this.processedCount = progress.processedCount || 0;
        console.log(`📊 Resuming from ${this.processedCount} processed monsters`);
      }
      
    } catch (error) {
      console.error('❌ Error loading existing data:', error.message);
    }
  }

  async resumeCollection() {
    console.log('🔄 Resuming monster collection...\n');
    
    try {
      // Get the current state of the API
      const response = await this.makeRequest(`${OPEN5E_API_BASE}/monsters/?limit=1000`);
      
      if (response.data && response.data.results) {
        const totalMonsters = response.data.count;
        console.log(`📊 Total monsters available: ${totalMonsters}`);
        console.log(`📊 Already collected: ${this.monsters.length}`);
        console.log(`📊 Remaining: ${totalMonsters - this.processedCount}`);
        
        // Process remaining monsters
        await this.processRemainingMonsters(response.data.results, totalMonsters);
        
        // Continue with remaining pages if needed
        if (response.data.next && this.processedCount < totalMonsters) {
          await this.fetchRemainingPages(response.data.next, totalMonsters);
        }
      }
    } catch (error) {
      console.error('❌ Error resuming collection:', error.message);
      throw error;
    }
  }

  async processRemainingMonsters(monsterList, totalMonsters) {
    console.log(`🔄 Processing remaining monsters...`);
    
    for (let i = 0; i < monsterList.length; i++) {
      const monster = monsterList[i];
      
      // Skip if already processed
      if (this.existingMonsters.has(monster.slug)) {
        continue;
      }
      
      this.processedCount++;
      console.log(`Processing ${this.processedCount}/${totalMonsters}: ${monster.name}`);
      
      try {
        const detailedResponse = await this.makeRequest(`${OPEN5E_API_BASE}/monsters/${monster.slug}/`);
        this.monsters.push(detailedResponse.data);
        this.successfulCount++;
        this.existingMonsters.add(monster.slug);
        
        // Save progress periodically
        if (this.successfulCount % CONFIG.saveInterval === 0) {
          await this.saveProgress();
        }
        
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
        this.showProgress(totalMonsters);
      }
    }
  }

  async fetchRemainingPages(nextUrl, totalMonsters) {
    let currentUrl = nextUrl;
    let pageCount = 2;
    
    while (currentUrl && this.processedCount < totalMonsters) {
      try {
        console.log(`📄 Fetching page ${pageCount}...`);
        const response = await this.makeRequest(currentUrl);
        
        if (response.data && response.data.results) {
          console.log(`📄 Page ${pageCount} contains ${response.data.results.length} monsters`);
          await this.processRemainingMonsters(response.data.results, totalMonsters);
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
        break;
      }
    }
  }

  async makeRequest(url, retryCount = 0) {
    try {
      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          'User-Agent': 'AllTheMonsters-Resumer/1.0'
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
        timestamp: new Date().toISOString(),
        elapsedTime: Date.now() - this.startTime
      };
      await fs.writeJson(progressPath, progress, { spaces: 2 });
    } catch (error) {
      console.error('⚠️  Could not save progress:', error.message);
    }
  }

  showProgress(totalMonsters) {
    const elapsed = Date.now() - this.startTime;
    const elapsedMinutes = Math.floor(elapsed / 60000);
    const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
    
    const successRate = this.processedCount > 0 ? 
      ((this.successfulCount / this.processedCount) * 100).toFixed(1) : 0;
    
    console.log(`📊 Progress: ${this.processedCount}/${totalMonsters} (${successRate}% success) - ${elapsedMinutes}m ${elapsedSeconds}s elapsed`);
  }

  async saveMonsters() {
    console.log('💾 Saving updated monster data...');
    
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
    
    // Save errors
    if (this.errors.length > 0) {
      const errorsPath = path.join(OUTPUT_DIR, 'errors.json');
      await fs.writeJson(errorsPath, this.errors, { spaces: 2 });
      console.log(`⚠️  Saved ${this.errors.length} errors to ${errorsPath}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    console.log('🔄 Monster Collection Resumer\n');
    
    try {
      await this.loadExistingData();
      await this.resumeCollection();
      await this.saveMonsters();
      
      const totalTime = Date.now() - this.startTime;
      const totalMinutes = Math.floor(totalTime / 60000);
      const totalSeconds = Math.floor((totalTime % 60000) / 1000);
      
      console.log('\n🎉 Resume completed successfully!');
      console.log(`📊 Total monsters collected: ${this.monsters.length}`);
      console.log(`📊 Success rate: ${((this.successfulCount / this.processedCount) * 100).toFixed(1)}%`);
      console.log(`⏱️  Resume time: ${totalMinutes}m ${totalSeconds}s`);
      if (this.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${this.errors.length}`);
      }
    } catch (error) {
      console.error('❌ Resume failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the resumer
const resumer = new MonsterResumer();
resumer.run(); 