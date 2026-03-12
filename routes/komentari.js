const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection
const { validate } = require('../middleware/validate');
const { createKomentarSchema } = require('../validators/ostaleSchemas');

// Endpoint to fetch all comments for a course
router.get('/kurs/:kursId', async (req, res) => {
    try {
        const kursId = req.params.kursId;
        const query = `
            SELECT k.komentar, k.created_at, k.rating, u.ime, u.prezime 
            FROM komentari k 
            JOIN korisnici u ON k.korisnik_id = u.id 
            WHERE k.kurs_id = ?
            ORDER BY k.created_at DESC
        `;
        const [results] = await db.query(query, [kursId]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Endpoint to add a new comment
router.post('/', validate(createKomentarSchema), async (req, res) => {
    try {
        const { korisnik_id, kurs_id, komentar, rating } = req.body;

        const query = 'INSERT INTO komentari (kurs_id, korisnik_id, komentar, rating) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [kurs_id, korisnik_id, komentar, rating]);
        
        res.status(201).json({ message: 'Comment added successfully', id: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;