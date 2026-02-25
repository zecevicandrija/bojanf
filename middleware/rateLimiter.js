/**
 * Rate Limiting Middleware
 * Koristi express-rate-limit za zaštitu od brute-force i DDoS napada
 * 
 * Tri nivoa:
 * 1. globalLimiter  - 100 req/min po IP (svi endpointi)
 * 2. authLimiter    - 10 req/min po IP (login, register)
 * 3. paymentLimiter - 5 req/min po IP (payment endpoints)
 * 4. aiLimiter      - 5 req/min po IP (DeepSeek AI review)
 * 
 * VAŽNO: Pošto koristiš Nginx reverse proxy, moraš dodati
 * app.set('trust proxy', 1) u index.js da bi IP adresa bila ispravna
 */

const rateLimit = require('express-rate-limit');

// Globalni rate limiter za SVE rute
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minut
    max: 100,                   // max 100 zahteva po IP u tom periodu
    standardHeaders: true,      // Vraća rate limit info u `RateLimit-*` headerima
    legacyHeaders: false,       // Isključi `X-RateLimit-*` headere
    message: {
        error: 'Previše zahteva',
        message: 'Prekoračili ste limit zahteva. Pokušajte ponovo za 1 minut.'
    }
});

// Auth rate limiter - strožiji za login/register
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minut
    max: 10,                    // max 10 pokušaja logina po IP u minutu
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Previše pokušaja prijave',
        message: 'Prekoračili ste limit pokušaja. Sačekajte 1 minut.'
    }
});

// Payment rate limiter - najstrožiji
const paymentLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minut
    max: 5,                     // max 5 payment zahteva po IP u minutu
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Previše zahteva za plaćanje',
        message: 'Prekoračili ste limit. Sačekajte 1 minut pre ponovnog pokušaja.'
    }
});

// AI Review rate limiter - ograničen jer koristi eksterni API
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minut
    max: 5,                     // max 5 AI review zahteva po IP u minutu
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Previše AI zahteva',
        message: 'Prekoračili ste limit AI provere koda. Sačekajte 1 minut.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    paymentLimiter,
    aiLimiter
};
