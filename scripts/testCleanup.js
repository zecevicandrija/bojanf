// backend/scripts/testCleanup.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../db');

console.log('🧪 Manually triggering subscription cleanup...');
console.log('Server time:', new Date().toISOString());

async function runCleanup() {
    console.log('\n========================================');
    console.log('🕐 SUBSCRIPTION CLEANUP STARTED');
    console.log('========================================\n');

    // 1. Prikaži sve aktivne korisnike i kad im ističe pretplata
    const [activeUsers] = await db.query(`
        SELECT id, email, subscription_status, subscription_expires_at 
        FROM korisnici 
        WHERE subscription_status = 'active'
        ORDER BY subscription_expires_at ASC
    `);

    console.log(`📊 Currently active subscriptions: ${activeUsers.length}`);
    activeUsers.forEach(user => {
        const expired = new Date(user.subscription_expires_at) < new Date();
        console.log(`   - User ${user.id} (${user.email}): expires ${user.subscription_expires_at} ${expired ? '⚠️ EXPIRED' : '✅ VALID'}`);
    });

    // 2. Ažuriraj istekle pretplate
    const [result] = await db.query(`
        UPDATE korisnici 
        SET subscription_status = 'expired' 
        WHERE subscription_expires_at < NOW() 
        AND subscription_status = 'active'
    `);

    const updatedCount = result.affectedRows;

    if (updatedCount > 0) {
        console.log(`\n✅ Cleanup done: ${updatedCount} user(s) marked as expired`);
    } else {
        console.log('\n✅ Cleanup done: No expired subscriptions found');
    }

    // 3. Prikaži korisnike kojima ističe u sledećih 3 dana
    const [expiringUsers] = await db.query(`
        SELECT id, email, subscription_expires_at 
        FROM korisnici 
        WHERE subscription_expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
        AND subscription_status = 'active'
    `);

    if (expiringUsers.length > 0) {
        console.log(`\n⚠️  ${expiringUsers.length} user(s) expiring in next 3 days:`);
        expiringUsers.forEach(user => {
            console.log(`   - ${user.email} expires at ${user.subscription_expires_at}`);
        });
    }

    console.log('\n========================================');
    console.log('✅ SUBSCRIPTION CLEANUP COMPLETED');
    console.log('========================================');
}

runCleanup()
    .then(() => {
        console.log('✅ Job finished');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Job failed:', err);
        process.exit(1);
    });
