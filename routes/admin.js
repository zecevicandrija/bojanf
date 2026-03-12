// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/token');
const requireAdmin = require('../middleware/requireAdmin');

// Cron job za čišćenje isteklih pretplata
router.post('/cleanup-expired-subscriptions', authMiddleware, requireAdmin, async (req, res) => {
    try {
        console.log('=== POKRETANJE CLEANUP EXPIRED SUBSCRIPTIONS ===');
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Pronađi sve korisnike čije su pretplate istekle
            const [expiredUsers] = await connection.query(`
                SELECT id, email, subscription_expires_at 
                FROM korisnici 
                WHERE subscription_expires_at < NOW() 
                AND subscription_status IN ('active', 'payment_failed')
            `);
            
            console.log(`Pronađeno ${expiredUsers.length} isteklih pretplata`);
            
            if (expiredUsers.length > 0) {
                // Izvuci sve ID-jeve u jednu matricu
                const expiredIds = expiredUsers.map(u => u.id);
                
                // BULK operacija 1: Obriši sve kupovine odjednom
                await connection.query(
                    'DELETE FROM kupovina WHERE korisnik_id IN (?)',
                    [expiredIds]
                );
                
                // BULK operacija 2: Ažuriraj sve statuse odjednom
                await connection.query(
                    'UPDATE korisnici SET subscription_status = ? WHERE id IN (?)',
                    ['expired', expiredIds]
                );
                
                console.log(`Bulk operacija završena: ${expiredIds.length} korisnika obrađeno`);
                expiredUsers.forEach(u => console.log(`  → ${u.email}`));
            }
            
            await connection.commit();
            
            res.json({ 
                success: true, 
                message: `Processed ${expiredUsers.length} expired subscriptions`,
                expiredCount: expiredUsers.length
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Greška u cleanup:', error);
        res.status(500).json({ error: 'Interna greška servera.' });
    }
});

// Dodatni endpoint za pregled subscription statistika
router.get('/subscription-stats', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                subscription_status,
                COUNT(*) as count,
                COUNT(CASE WHEN subscription_expires_at > NOW() THEN 1 END) as active_count,
                COUNT(CASE WHEN subscription_expires_at <= NOW() THEN 1 END) as expired_count
            FROM korisnici 
            WHERE subscription_expires_at IS NOT NULL
            GROUP BY subscription_status
        `);
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Greška pri dohvatanju statistika:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;