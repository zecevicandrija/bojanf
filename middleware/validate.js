/**
 * validate.js - Middleware za Zod schema validaciju
 * ------------------------------------------------
 * Generički middleware koji prima Zod šemu i validira req.body pre
 * nego što request stigne do route handler-a.
 * 
 * Korišćenje:
 *   const { validate } = require('../middleware/validate');
 *   const { loginSchema } = require('../validators/authSchemas');
 * 
 *   router.post('/login', validate(loginSchema), async (req, res) => { ... });
 * 
 * Ako validacija ne prođe, vraća 400 sa detaljnim greškama.
 * Ako prođe, čisti req.body tako da sadrži SAMO polja iz šeme (strip nepoznatih).
 */

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map(err => ({
            polje: err.path.join('.'),
            poruka: err.message
        }));

        return res.status(400).json({
            error: 'Validacija nije uspela.',
            detalji: errors
        });
    }

    // Zameni req.body sa validiranim i očišćenim podacima
    // (strip: true uklanja sva polja koja nisu u šemi)
    req.body = result.data;
    next();
};

/**
 * validateQuery - Middleware za validaciju query parametara (req.query)
 */
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        const errors = result.error.issues.map(err => ({
            polje: err.path.join('.'),
            poruka: err.message
        }));

        return res.status(400).json({
            error: 'Validacija parametara nije uspela.',
            detalji: errors
        });
    }

    req.query = result.data;
    next();
};

/**
 * validateParams - Middleware za validaciju URL parametara (req.params)
 */
const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        const errors = result.error.issues.map(err => ({
            polje: err.path.join('.'),
            poruka: err.message
        }));

        return res.status(400).json({
            error: 'Validacija parametara nije uspela.',
            detalji: errors
        });
    }

    req.params = result.data;
    next();
};

module.exports = { validate, validateQuery, validateParams };
