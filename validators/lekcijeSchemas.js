/**
 * Lekcije Schemas - Validacione šeme za lekcije rute
 * 
 * Pokriva: /api/lekcije (POST, PUT, prepare-upload, deepseek-review)
 */

const { z } = require('zod');

// =============================================
// POST /api/lekcije/prepare-upload
// =============================================
const prepareUploadSchema = z.object({
    title: z.string()
        .trim()
        .min(1, 'Naslov videa je obavezan.')
        .max(255, 'Naslov ne sme biti duži od 255 karaktera.')
}).strict();

// =============================================
// POST /api/lekcije - Kreiranje lekcije
// =============================================
const createLekcijaSchema = z.object({
    course_id: z.coerce.number({ invalid_type_error: 'course_id mora biti broj.' })
        .int()
        .positive('course_id mora biti pozitivan broj.'),

    title: z.string()
        .trim()
        .min(1, 'Naslov lekcije je obavezan.')
        .max(255, 'Naslov ne sme biti duži od 255 karaktera.'),

    content: z.string()
        .trim()
        .min(1, 'Sadržaj lekcije je obavezan.')
        .max(50000, 'Sadržaj ne sme biti duži od 50000 karaktera.'),

    sekcija_id: z.coerce.number({ invalid_type_error: 'sekcija_id mora biti broj.' })
        .int()
        .positive()
        .optional()
        .nullable(),

    video_guid: z.string()
        .trim()
        .min(1, 'video_guid je obavezan.')
        .max(255, 'video_guid ne sme biti duži od 255 karaktera.')
}).strict();

// =============================================
// PUT /api/lekcije/:id - Ažuriranje lekcije
// =============================================
const updateLekcijaSchema = z.object({
    course_id: z.coerce.number({ invalid_type_error: 'course_id mora biti broj.' })
        .int()
        .positive('course_id mora biti pozitivan broj.'),

    title: z.string()
        .trim()
        .min(1, 'Naslov lekcije je obavezan.')
        .max(255, 'Naslov ne sme biti duži od 255 karaktera.'),

    content: z.string()
        .trim()
        .min(1, 'Sadržaj lekcije je obavezan.')
        .max(50000, 'Sadržaj ne sme biti duži od 50000 karaktera.'),

    sekcija_id: z.coerce.number({ invalid_type_error: 'sekcija_id mora biti broj.' })
        .int()
        .positive()
        .optional()
        .nullable(),

    video_guid: z.string()
        .trim()
        .max(255)
        .optional()
        .nullable()
}).strict();

// =============================================
// POST /api/lekcije/deepseek-review
// =============================================
const deepseekReviewSchema = z.object({
    code: z.string()
        .min(1, 'Kod je obavezan.')
        .max(50000, 'Kod ne sme biti duži od 50000 karaktera.'),

    language: z.string()
        .trim()
        .min(1, 'Programski jezik je obavezan.')
        .max(50, 'Jezik ne sme biti duži od 50 karaktera.')
}).strict();

module.exports = {
    prepareUploadSchema,
    createLekcijaSchema,
    updateLekcijaSchema,
    deepseekReviewSchema
};
