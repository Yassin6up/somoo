async function testWalletEndpoint() {
  try {
    // First login to get a token
    console.log('🔐 Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/product-owners/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@gmail.com',
        password: '1234' // assuming this is the password
      })
    });
    
    const loginData = await loginRes.json();
    console.log('✅ Login response:', loginData);
    
    if (!loginData.token) {
      console.log('❌ No token received');
      return;
    }
    
    const token = loginData.token;
    const userId = loginData.user.id;
    
    console.log('\n💰 Fetching wallet...');
    console.log('URL:', `http://localhost:5000/api/product-owners/${userId}/wallet`);
    
    const walletRes = await fetch(`http://localhost:5000/api/product-owners/${userId}/wallet`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📥 Wallet response status:', walletRes.status);
    const walletData = await walletRes.json();
    console.log('💼 Wallet data:', JSON.stringify(walletData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWalletEndpoint();
