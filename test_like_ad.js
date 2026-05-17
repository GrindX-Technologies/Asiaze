const http = require('http');

async function runTest() {
  console.log("=== End-to-End Functional Test: Like Ad ===");
  const baseUrl = 'https://asiaze.cloud/api';
  const testEmail = 'testadmin_like@example.com';
  
  try {
    // Register
    const regRes = await fetch(baseUrl + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Liker',
        email: testEmail,
        password: 'password123',
        phone: '1234567890',
        state: 'TestState'
      })
    });
    let token = '';
    if (regRes.ok) {
      token = (await regRes.json()).token;
    } else {
      const loginRes = await fetch(baseUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'password123' })
      });
      token = (await loginRes.json()).token;
    }
    console.log("Token:", token.substring(0, 10) + "...");

    // Get an Ad
    const adsRes = await fetch(baseUrl + '/ads');
    const ads = await adsRes.json();
    if (ads.length === 0) {
      console.log("No ads found.");
      return;
    }
    const adId = ads[0]._id;
    console.log("Ad ID:", adId);
    console.log("Initial Likes:", ads[0].likes);

    // Toggle Like
    const likeRes = await fetch(baseUrl + `/ads/${adId}/like`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const updatedAd = await likeRes.json();
    console.log("Updated Likes:", updatedAd.likes);

  } catch (err) {
    console.error(err);
  }
}
runTest();
