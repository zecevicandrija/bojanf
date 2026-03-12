/**
 * requireAdmin Middleware
 * ----------------------
 * Proverava da li autentifikovani korisnik ima admin ulogu.
 * 
 * NAPOMENA: Ovaj middleware MORA biti korišćen NAKON authMiddleware-a,
 * jer zavisi od toga da `req.user` postoji i sadrži `uloga` polje
 * koje se dekodira iz JWT tokena.
 * 
 * Primer upotrebe:
 *   router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => { ... })
 */

const requireAdmin = (req, res, next) => {
    // Provera da li authMiddleware postavlja req.user (sigurnosna provera)
    if (!req.user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Morate biti ulogovani.'
        });
    }

    // Provera da li korisnik ima admin ulogu
    if (req.user.uloga !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Nemate dozvolu za ovu akciju. Potrebna je admin uloga.'
        });
    }

    next();
};

module.exports = requireAdmin;
