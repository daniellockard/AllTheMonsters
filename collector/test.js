import axios from 'axios';

const OPEN5E_API_BASE = 'https://api.open5e.com';

async function testAPI() {
  console.log('🧪 Testing Open5e API connection...\n');
  
  try {
    // Test basic API connectivity
    console.log('1. Testing API base endpoint...');
    const baseResponse = await axios.get(OPEN5E_API_BASE);
    console.log('✅ API is accessible');
    
    // Test monsters endpoint
    console.log('\n2. Testing monsters endpoint...');
    const monstersResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/`);
    
    if (monstersResponse.data && monstersResponse.data.results) {
      console.log(`✅ Found ${monstersResponse.data.results.length} monsters`);
      
      // Test a few specific monsters
      console.log('\n3. Testing individual monster endpoints...');
      const testMonsters = monstersResponse.data.results.slice(0, 3);
      
      for (const monster of testMonsters) {
        try {
          const detailedResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/${monster.slug}/`);
          console.log(`✅ ${monster.name} (${monster.slug}) - ${detailedResponse.data.challenge_rating || 'Unknown CR'}`);
        } catch (error) {
          console.log(`❌ ${monster.name} (${monster.slug}) - Error: ${error.message}`);
        }
      }
      
      // Show sample monster data structure
      if (testMonsters.length > 0) {
        const sampleMonster = testMonsters[0];
        const detailedResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/${sampleMonster.slug}/`);
        console.log('\n📋 Sample monster data structure:');
        console.log(`   Name: ${detailedResponse.data.name}`);
        console.log(`   Type: ${detailedResponse.data.type}`);
        console.log(`   Size: ${detailedResponse.data.size}`);
        console.log(`   CR: ${detailedResponse.data.challenge_rating}`);
        console.log(`   HP: ${detailedResponse.data.hit_points}`);
        console.log(`   AC: ${JSON.stringify(detailedResponse.data.armor_class)}`);
      }
      
    } else {
      console.log('❌ Unexpected response format from monsters endpoint');
    }
    
    console.log('\n🎉 API test completed successfully!');
    console.log('Ready to run the full monster collection.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI(); 