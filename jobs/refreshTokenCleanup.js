/**
 * Refresh Token Cleanup Cron Job
 * 
 * SVRHA: Čisti istekle refresh tokene iz baze
 * 
 * KADA SE POKREĆE: Svaki dan u 02:00 (noću, mali promet)
 * 
 * ŠTA RADI:
 * 1. Briše sve refresh tokene čiji expires_at je prošao
 * 2. Loguje koliko je tokena obrisano
 * 
 * ZAŠTO: Refresh tokeni se rotiraju (stari se briše pri svakom refresh-u),
 *        ali ako korisnik ne refreshuje (npr. ostavi tab zatvoren), stari
 *        tokeni ostaju u bazi. Ovaj job ih čisti.
 */

const cron = require('node-cron');
const db = require('../db');

function startRefreshTokenCleanupJob() {
    // Pokreće se svaki dan u 02:00
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('🔑 Running refresh token cleanup job...');

            const [result] = await db.query(
                'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
            );

            const deletedCount = result.affectedRows;

            if (deletedCount > 0) {
                console.log(`✅ Refresh token cleanup: ${deletedCount} expired token(s) removed`);
            } else {
                console.log('✅ Refresh token cleanup: No expired tokens found');
            }

        } catch (error) {
            console.error('❌ Error in refresh token cleanup job:', error);
        }
    });

    console.log('✅ Refresh token cleanup cron job started (runs daily at 02:00)');
}

module.exports = { startRefreshTokenCleanupJob };
