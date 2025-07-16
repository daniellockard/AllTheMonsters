import axios from 'axios';

const OPEN5E_API_BASE = 'https://api.open5e.com';

async function debugAPI() {
  console.log('🔍 Debugging Open5e API pagination...\n');
  
  try {
    // Test the base monsters endpoint
    console.log('1. Testing base monsters endpoint...');
    const response = await axios.get(`${OPEN5E_API_BASE}/monsters/`);
    
    console.log('Response structure:');
    console.log('- Has results:', !!response.data.results);
    console.log('- Results length:', response.data.results?.length);
    console.log('- Has count:', !!response.data.count);
    console.log('- Total count:', response.data.count);
    console.log('- Has next:', !!response.data.next);
    console.log('- Next URL:', response.data.next);
    console.log('- Has previous:', !!response.data.previous);
    
    if (response.data.next) {
      console.log('\n2. Testing next page...');
      const nextResponse = await axios.get(response.data.next);
      console.log(`- Next page results: ${nextResponse.data.results?.length}`);
      console.log(`- Next page count: ${nextResponse.data.count}`);
      console.log(`- Has another next: ${!!nextResponse.data.next}`);
    }
    
    // Test different query parameters
    console.log('\n3. Testing with different parameters...');
    
    // Test with limit parameter
    const limitResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/?limit=100`);
    console.log(`- With limit=100: ${limitResponse.data.results?.length} results`);
    console.log(`- Total count: ${limitResponse.data.count}`);
    
    // Test with offset parameter
    const offsetResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/?offset=50`);
    console.log(`- With offset=50: ${offsetResponse.data.results?.length} results`);
    
    // Test with search parameter
    const searchResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/?search=dragon`);
    console.log(`- Search for "dragon": ${searchResponse.data.results?.length} results`);
    
    // Test with type filter
    const typeResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/?type=dragon`);
    console.log(`- Filter by type=dragon: ${typeResponse.data.results?.length} results`);
    
    // Test with challenge rating filter
    const crResponse = await axios.get(`${OPEN5E_API_BASE}/monsters/?challenge_rating=1`);
    console.log(`- Filter by CR=1: ${crResponse.data.results?.length} results`);
    
    console.log('\n4. Testing all available endpoints...');
    
    // Test different endpoints
    const endpoints = [
      '/monsters/',
      '/monsters/?limit=1000',
      '/monsters/?limit=1000&offset=0',
      '/monsters/?search=',
      '/monsters/?type=',
      '/monsters/?challenge_rating='
    ];
    
    for (const endpoint of endpoints) {
      try {
        const testResponse = await axios.get(`${OPEN5E_API_BASE}${endpoint}`);
        console.log(`${endpoint}: ${testResponse.data.results?.length} results (total: ${testResponse.data.count})`);
      } catch (error) {
        console.log(`${endpoint}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugAPI(); 