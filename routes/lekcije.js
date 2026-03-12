const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/token');
const requireAdmin = require('../middleware/requireAdmin');
const checkSubscription = require('../middleware/checkSubscription');
const { cacheMiddleware, invalidateCache } = require('../middleware/cacheMiddleware');
const { getSecurePlayerUrl, createUploadCredentials } = require('../utils/bunny');
const { validate } = require('../middleware/validate');
const { prepareUploadSchema, createLekcijaSchema, updateLekcijaSchema, deepseekReviewSchema } = require('../validators/lekcijeSchemas');


// --- NOVA RUTA: Priprema za direktan upload ---
// Frontend poziva ovu rutu da dobije kredencijale za direktan TUS upload na Bunny
router.post('/prepare-upload', authMiddleware, requireAdmin, validate(prepareUploadSchema), async (req, res) => {
    try {
        const { title } = req.body;

        // Generiši kredencijale za direktan upload
        const credentials = await createUploadCredentials(title);

        res.status(200).json(credentials);
    } catch (error) {
        console.error('Greška pri pripremi uploada:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// --- POST Dodavanje lekcije (NOVA LOGIKA - samo metadata) ---
// Video je već uploadovan direktno na Bunny, ovde samo čuvamo metadata
router.post('/', authMiddleware, requireAdmin, validate(createLekcijaSchema), async (req, res) => {
    try {
        const { course_id, title, content, sekcija_id, video_guid } = req.body;

        // Čuvamo lekciju u bazu - video je već na Bunny-ju
        const query = 'INSERT INTO lekcije (course_id, title, content, video_url, sekcija_id) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [course_id, title, content, video_guid, sekcija_id || null]);

        invalidateCache('/api/lekcije'); // Obriši keš lekcija
        res.status(201).json({ message: 'Lekcija uspešno dodata.' });
    } catch (error) {
        console.error('Greška pri dodavanju lekcije:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// --- PUT Ažuriranje lekcije (BEZ MULTER-a — video se šalje direktno na Bunny sa frontenda) ---
router.put('/:id', authMiddleware, requireAdmin, validate(updateLekcijaSchema), async (req, res) => {
    try {
        const lessonId = req.params.id;
        const { course_id, title, content, sekcija_id, video_guid } = req.body;

        // Ako je novi video_guid prosleđen (zamena videa), koristimo njega.
        // U suprotnom, zadržavamo stari video_url iz baze.
        let newVideoUrl;
        if (video_guid) {
            newVideoUrl = video_guid;
        } else {
            // Dohvati postojeći video_url iz baze
            const [existing] = await db.query('SELECT video_url FROM lekcije WHERE id = ?', [lessonId]);
            if (existing.length === 0) {
                return res.status(404).json({ error: `Lekcija sa ID-jem ${lessonId} nije pronađena.` });
            }
            newVideoUrl = existing[0].video_url;
        }

        const query = 'UPDATE lekcije SET course_id = ?, title = ?, content = ?, video_url = ?, sekcija_id = ? WHERE id = ?';
        await db.query(query, [course_id, title, content, newVideoUrl, sekcija_id, lessonId]);

        res.status(200).json({ message: `Lekcija sa ID-jem ${lessonId} uspešno ažurirana.` });
        invalidateCache('/api/lekcije');
    } catch (error) {
        console.error('Greška pri ažuriranju lekcije:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// --- RUTA: Dobijanje sigurnog linka za video ---
// ZAŠTIĆENA RUTA - Provera subscription-a!
router.get('/:id/stream', authMiddleware, checkSubscription, async (req, res) => {
    try {
        const { id } = req.params;
        const [lekcije] = await db.query('SELECT video_url FROM lekcije WHERE id = ?', [id]);

        if (lekcije.length === 0 || !lekcije[0].video_url) {
            return res.status(404).json({ error: 'Video nije pronađen.' });
        }

        const videoId = lekcije[0].video_url;
        const secureUrl = getSecurePlayerUrl(videoId); // Koristimo NOVU, sigurnu funkciju

        res.json({ url: secureUrl });
    } catch (error) {
        console.error('Greška pri generisanju linka:', error);
        res.status(500).json({ error: 'Greška na serveru.' });
    }
});

// GET Sve lekcije (NEMA IZMENA)
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM lekcije');
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET Lekcije po kursu (keširano 5 minuta)
router.get('/course/:courseId', cacheMiddleware(300), async (req, res) => {
    try {
        const { courseId } = req.params;
        const [results] = await db.query('SELECT * FROM lekcije WHERE course_id = ?', [courseId]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE Brisanje lekcije (NEMA IZMENA)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const [results] = await db.query('DELETE FROM lekcije WHERE id = ?', [lessonId]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: `Lekcija sa ID-jem ${lessonId} nije pronađena.` });
        }
        res.status(200).json({ message: `Lekcija sa ID-jem ${lessonId} uspešno obrisana.` });
        invalidateCache('/api/lekcije'); // Obriši keš lekcija
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// =======================================================================
// IZMENA: CEO ENDPOINT JE AŽURIRAN DA KORISTI NOVU 'sekcije' TABELU
// =======================================================================
// GET Sekcije po kursu (keširano 10 minuta)
router.get('/sections/:courseId', cacheMiddleware(600), async (req, res) => {
    try {
        const { courseId } = req.params;
        // Upit sada ide u tabelu `sekcije` i sortira po našoj `redosled` koloni
        const query = 'SELECT id, naziv, redosled FROM sekcije WHERE kurs_id = ? ORDER BY redosled ASC';
        const [results] = await db.query(query, [courseId]);
        // Vraćamo cele objekte (id, naziv, redosled) koji su potrebni za frontend
        res.status(200).json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET Broj lekcija po kursu (NEMA IZMENA)
router.get('/count/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const [results] = await db.query('SELECT COUNT(*) AS lessonCount FROM lekcije WHERE course_id = ?', [courseId]);
        res.status(200).json({ lessonCount: results[0].lessonCount });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DeepSeek AI ruta
router.post('/deepseek-review', authMiddleware, requireAdmin, validate(deepseekReviewSchema), async (req, res) => {
    const { code, language } = req.body;
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful code reviewer. Provide feedback in Serbian.' },
                    { role: 'user', content: `Ovo je moj kod:\n\`\`\`${language}\n${code}\n\`\`\`\nMolim te pogledaj greške i predloži poboljšanja.` }
                ],
            })
        });
        if (!response.ok) throw new Error(`DeepSeek API returned status ${response.status}`);
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || 'Greška u AI odgovoru.';
        res.json({ success: true, message: reply });
    } catch (err) {
        console.error('DeepSeek API error:', err);
        res.status(500).json({ success: false, error: 'Greška pri povezivanju sa DeepSeek API-jem' });
    }
});


module.exports = router;