import { db } from './server/db.js';
import { productOwnerWallets, productOwners } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkWallet() {
  try {
    console.log('🔍 Checking all product owner wallets...\n');
    
    // Get all wallets
    const wallets = await db.select().from(productOwnerWallets);
    console.log('📊 Total wallets found:', wallets.length);
    console.log('💰 Wallet data:', JSON.stringify(wallets, null, 2));
    
    // Get product owner with email owner@gmail.com
    const owner = await db.select()
      .from(productOwners)
      .where(eq(productOwners.email, 'owner@gmail.com'))
      .limit(1);
    
    if (owner.length > 0) {
      console.log('\n✅ Product Owner Found:');
      console.log('   ID:', owner[0].id);
      console.log('   Email:', owner[0].email);
      console.log('   Name:', owner[0].fullName);
      
      // Check if wallet exists for this owner
      const wallet = await db.select()
        .from(productOwnerWallets)
        .where(eq(productOwnerWallets.productOwnerId, owner[0].id))
        .limit(1);
      
      if (wallet.length > 0) {
        console.log('\n💼 Wallet Details:');
        console.log('   Wallet ID:', wallet[0].id);
        console.log('   Available Balance:', wallet[0].availableBalance);
        console.log('   Escrow Balance:', wallet[0].escrowBalance);
        console.log('   Created At:', wallet[0].createdAt);
      } else {
        console.log('\n❌ No wallet found for this product owner!');
      }
    } else {
      console.log('\n❌ Product owner not found with email: owner@gmail.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkWallet();
