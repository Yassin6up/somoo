import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/smoo'
});

const db = drizzle(pool, { schema });
const { productOwners, productOwnerWallets } = schema;

async function addBalance() {
  try {
    console.log('🔍 Updating wallet balance...\n');
    
    // Get product owner with email owner@gmail.com
    const owner = await db.select()
      .from(productOwners)
      .where(eq(productOwners.email, 'owner@gmail.com'))
      .limit(1);
    
    if (owner.length > 0) {
      console.log('✅ Product Owner Found:');
      console.log('   ID:', owner[0].id);
      console.log('   Email:', owner[0].email);
      console.log('   Name:', owner[0].fullName);
      
      // Update wallet to 1000 SAR available balance
      const updated = await db.update(productOwnerWallets)
        .set({ 
          availableBalance: '1000.00',
          updatedAt: new Date()
        })
        .where(eq(productOwnerWallets.productOwnerId, owner[0].id))
        .returning();
      
      if (updated.length > 0) {
        console.log('\n💼 Wallet Updated:');
        console.log('   Available Balance:', updated[0].availableBalance, 'SAR');
        console.log('   Escrow Balance:', updated[0].escrowBalance, 'SAR');
        console.log('   ✅ Successfully set available balance to 1000 SAR');
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

addBalance();
