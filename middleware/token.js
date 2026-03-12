// token.js - Auth middleware za verifikaciju access tokena
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // EXEMPT PATHS: rute koje ne zahtevaju autorizaciju
    const openPaths = [
        '/api/webhooks',           // webhook endpoints
        '/api/msu/callback',       // MSU/Chipcard payment callbacks
        // dodaj druge rute ako koristiš
    ];

    // Ako putanja započinje nekom od exempt pathova, preskoči autorizaciju
    if (openPaths.some(p => req.path.startsWith(p))) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Nema tokena, autorizacija odbijena.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // KLJUČNA RAZLIKA: Razlikujemo istekao token od potpuno nevažećeg
        if (error.name === 'TokenExpiredError') {
            // 401 sa posebnom porukom — frontend zna da treba da refreshuje
            return res.status(401).json({ 
                message: 'Token je istekao.', 
                code: 'TOKEN_EXPIRED' 
            });
        }
        // Token je potpuno nevažeći (falsifikovan, pogrešan potpis, itd.)
        return res.status(401).json({ 
            message: 'Token nije validan.', 
            code: 'TOKEN_INVALID' 
        });
    }
};

module.exports = authMiddleware;
