import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testShare() {
  try {
    // Register
    const regRes = await axios.post('https://asiaze.cloud/api/auth/register', {
      name: 'Share Test User',
      email: `sharetest${Date.now()}@example.com`,
      password: 'password123'
    });
    
    const token = regRes.data.token;
    console.log('Registered, token:', token);

    // Initial Profile
    let profile = await axios.get('https://asiaze.cloud/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Initial Points:', profile.data.points);

    // Share Item 1
    console.log('\n--- Sharing Item 1 ---');
    const shareRes1 = await axios.post('https://asiaze.cloud/api/users/share', 
      { itemId: 'item_123', itemType: 'article' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Share 1 result:', shareRes1.data);

    // Check Points
    profile = await axios.get('https://asiaze.cloud/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Points after Share 1:', profile.data.points);

    // Share Item 1 again (should fail)
    console.log('\n--- Sharing Item 1 Again (Duplicate) ---');
    try {
      await axios.post('https://asiaze.cloud/api/users/share', 
        { itemId: 'item_123', itemType: 'article' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('ERROR: Duplicate share succeeded when it should have failed!');
    } catch (e: any) {
      console.log('Duplicate share failed as expected. Message:', e.response?.data?.message);
    }

    // Share Item 2
    console.log('\n--- Sharing Item 2 ---');
    const shareRes2 = await axios.post('https://asiaze.cloud/api/users/share', 
      { itemId: 'item_456', itemType: 'reel' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Share 2 result:', shareRes2.data);

    // Check Points
    profile = await axios.get('https://asiaze.cloud/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Points after Share 2:', profile.data.points);

  } catch (err: any) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

testShare();
