const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authMiddleware = require('../middleware/token');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authSchemas');

// =============================================
// Pomoćne funkcije za refresh token mehaniku
// =============================================

const ACCESS_TOKEN_EXPIRY = '60m';   // Access token traje 60 minuta
const REFRESH_TOKEN_DAYS = 7;        // Refresh token traje 7 dana

/**
 * Generiše kriptografski siguran random refresh token
 */
function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex'); // 80 hex karaktera
}

/**
 * Hashuje refresh token za čuvanje u bazi (SHA-256)
 * Nikad ne čuvamo sirovi token u bazi — isti princip kao za lozinke.
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Kreira access token (kratak, 15min)
 */
function createAccessToken(user) {
    return jwt.sign(
        { id: user.id, uloga: user.uloga },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

/**
 * Čuva refresh token u bazi i šalje ga kao HttpOnly cookie
 */
async function issueRefreshToken(res, userId) {
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await db.query(
        'INSERT INTO refresh_tokens (korisnik_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, tokenHash, expiresAt]
    );

    // Šaljemo refresh token SAMO kao HttpOnly cookie — JavaScript ga ne može pročitati
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,          // Sprečava XSS krađu
        secure: process.env.NODE_ENV === 'production',  // HTTPS only u produkciji
        sameSite: 'strict',      // Sprečava CSRF napade
        maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, // 7 dana u milisekundama
        path: '/api/auth'        // Cookie se šalje SAMO na auth rute (minimalno izlaganje)
    });

    return refreshToken;
}

// =============================================
// POST /api/auth/register
// =============================================
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
    try {
        const { ime, prezime, email, sifra, uloga } = req.body;
        const [existingUsers] = await db.query('SELECT email FROM korisnici WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Korisnik sa ovim emailom već postoji.' });
        }
        const hashedPassword = await bcrypt.hash(sifra, 10);
        const query = "INSERT INTO korisnici (ime, prezime, email, sifra, uloga) VALUES (?, ?, ?, ?, ?)";
        await db.query(query, [ime, prezime, email, hashedPassword, uloga]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Greška prilikom registracije:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// =============================================
// POST /api/auth/login
// =============================================
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
    try {
        const { email, sifra } = req.body;

        const query = 'SELECT id, ime, prezime, email, sifra, uloga, subscription_expires_at, subscription_status FROM korisnici WHERE email = ?';
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Pogrešni kredencijali.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(sifra, user.sifra);

        if (!isMatch) {
            return res.status(401).json({ message: 'Pogrešni kredencijali.' });
        }

        // 1. Kreiramo kratkoživući access token (15 min)
        const accessToken = createAccessToken(user);

        // 2. Kreiramo refresh token i čuvamo u bazi + HttpOnly cookie
        await issueRefreshToken(res, user.id);

        const { sifra: userPassword, ...userWithoutPassword } = user;

        // 3. Vraćamo access token u JSON body-ju (frontend ga čuva u memoriji/localStorage)
        //    Refresh token je već poslat kao HttpOnly cookie (frontend ga nikad ne vidi)
        res.status(200).json({ user: userWithoutPassword, accessToken });

    } catch (error) {
        console.error('Greška prilikom prijavljivanja:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// =============================================
// POST /api/auth/refresh — Obnovi access token
// =============================================
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token nije pronađen.' });
        }

        const tokenHash = hashToken(refreshToken);

        // 1. Pronađi refresh token u bazi
        const [tokens] = await db.query(
            'SELECT id, korisnik_id, expires_at FROM refresh_tokens WHERE token_hash = ?',
            [tokenHash]
        );

        if (tokens.length === 0) {
            // Token ne postoji u bazi — moguća krađa (replay napad)
            // Čistimo cookie za svaki slučaj
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/api/auth' });
            return res.status(401).json({ message: 'Refresh token nije validan.' });
        }

        const storedToken = tokens[0];

        // 2. Proveri da li je istekao
        if (new Date(storedToken.expires_at) < new Date()) {
            await db.query('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/api/auth' });
            return res.status(401).json({ message: 'Refresh token je istekao.' });
        }

        // 3. Dohvati korisnika
        const [users] = await db.query(
            'SELECT id, ime, prezime, email, uloga, subscription_expires_at, subscription_status FROM korisnici WHERE id = ?',
            [storedToken.korisnik_id]
        );

        if (users.length === 0) {
            await db.query('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/api/auth' });
            return res.status(401).json({ message: 'Korisnik nije pronađen.' });
        }

        const user = users[0];

        // 4. ROTACIJA: Obriši stari refresh token
        await db.query('DELETE FROM refresh_tokens WHERE id = ?', [storedToken.id]);

        // 5. Izdaj novi access token + novi refresh token
        const newAccessToken = createAccessToken(user);
        await issueRefreshToken(res, user.id);

        res.status(200).json({ accessToken: newAccessToken, user });

    } catch (error) {
        console.error('Greška prilikom refresha tokena:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// =============================================
// POST /api/auth/logout — Odjava (brisanje refresh tokena)
// =============================================
router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);
            // Obriši ovaj refresh token iz baze
            await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
        }

        // Obriši cookie
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/api/auth' });
        res.status(200).json({ message: 'Uspešna odjava.' });

    } catch (error) {
        console.error('Greška prilikom odjave:', error);
        res.status(500).json({ error: 'Došlo je do greške na serveru.' });
    }
});

// =============================================
// GET /api/auth/me — Trenutni korisnik
// =============================================
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const query = 'SELECT id, ime, prezime, email, uloga, subscription_expires_at, subscription_status FROM korisnici WHERE id = ?';
        const [users] = await db.query(query, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru.' });
    }
});

// =============================================
// POST /api/auth/change-password
// =============================================
router.post('/change-password', authMiddleware, validate(changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await db.query('SELECT sifra FROM korisnici WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.sifra);
        if (!isMatch) {
            return res.status(401).json({ message: 'Trenutna lozinka nije ispravna.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE korisnici SET sifra = ? WHERE id = ?', [hashedNewPassword, userId]);

        // SIGURNOST: Obriši SVE refresh tokene ovog korisnika (invalidira sve sesije)
        await db.query('DELETE FROM refresh_tokens WHERE korisnik_id = ?', [userId]);

        res.status(200).json({ message: 'Lozinka uspešno promenjena. Ponovo se prijavite.' });

    } catch (error) {
        console.error('Greška prilikom promene lozinke:', error);
        res.status(500).json({ error: 'Greška na serveru.' });
    }
});

module.exports = router;