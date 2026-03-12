/**
 * Auth Schemas - Validacione šeme za auth rute
 * 
 * Pokriva: /api/auth/register, /api/auth/login, /api/auth/change-password
 */

const { z } = require('zod');

// =============================================
// POST /api/auth/register
// =============================================
const registerSchema = z.object({
    ime: z.string()
        .trim()
        .min(1, 'Ime je obavezno.')
        .max(255, 'Ime ne sme biti duže od 255 karaktera.'),

    prezime: z.string()
        .trim()
        .min(1, 'Prezime je obavezno.')
        .max(255, 'Prezime ne sme biti duže od 255 karaktera.'),

    email: z.string()
        .trim()
        .toLowerCase()
        .email('Neispravan email format.')
        .max(100, 'Email ne sme biti duži od 100 karaktera.'),

    sifra: z.string()
        .min(6, 'Šifra mora imati najmanje 6 karaktera.')
        .max(255, 'Šifra ne sme biti duža od 255 karaktera.'),

    uloga: z.enum(['korisnik', 'admin', 'instruktor'], {
        errorMap: () => ({ message: 'Uloga mora biti "korisnik", "admin" ili "instruktor".' })
    })
}).strict();

// =============================================
// POST /api/auth/login
// =============================================
const loginSchema = z.object({
    email: z.string()
        .trim()
        .email('Neispravan email format.'),

    sifra: z.string()
        .min(1, 'Šifra je obavezna.')
}).strict();

// =============================================
// POST /api/auth/change-password
// =============================================
const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Trenutna lozinka je obavezna.'),

    newPassword: z.string()
        .min(6, 'Nova lozinka mora imati najmanje 6 karaktera.')
        .max(128, 'Nova lozinka ne sme biti duža od 128 karaktera.')
}).strict();

module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema
};
