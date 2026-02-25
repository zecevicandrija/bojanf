/**
 * In-Memory Cache Middleware
 * Koristi node-cache za keširanje GET odgovora
 * 
 * Kako radi:
 * 1. Kada stigne GET zahtev, proverava da li postoji keširani odgovor
 * 2. Ako postoji → odmah vraća 200 sa keširanim podatcima (ne udara u DB)
 * 3. Ako ne postoji → pušta request dalje, hvata response, kešira ga
 * 
 * Invalidacija:
 * - Pozovi invalidateCache('/api/kursevi') nakon POST/PUT/DELETE na kurseve
 * - Pozovi invalidateAll() za potpuno brisanje keša
 */

const NodeCache = require('node-cache');

// Jedna globalna instanca keša
// checkperiod: svaka 2 minuta proverava i briše istekle ključeve
const cache = new NodeCache({ checkperiod: 120 });

/**
 * Middleware factory - vraća middleware sa zadatim TTL-om
 * @param {number} ttlSeconds - koliko sekundi da se drži u kešu
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttlSeconds = 300) {
    return (req, res, next) => {
        // Keširamo samo GET zahteve
        if (req.method !== 'GET') {
            return next();
        }

        // Ključ keša = originalna URL putanja sa query parametrima
        const key = req.originalUrl || req.url;

        // Proveri da li postoji u kešu
        const cachedResponse = cache.get(key);
        if (cachedResponse !== undefined) {
            // Cache HIT - vrati keširani odgovor
            return res.status(200).json(cachedResponse);
        }

        // Cache MISS - sačuvaj originalni res.json da bismo uhvatili odgovor
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Keširaj samo uspešne odgovore (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, body, ttlSeconds);
            }
            return originalJson(body);
        };

        next();
    };
}

/**
 * Briše keš za sve ključeve koji počinju sa datim prefiksom
 * Primer: invalidateCache('/api/kursevi') briše i '/api/kursevi' i '/api/kursevi/5'
 * @param {string} prefix - URL prefiks za brisanje
 */
function invalidateCache(prefix) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.startsWith(prefix));
    if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
    }
}

/**
 * Briše SVE iz keša
 */
function invalidateAll() {
    cache.flushAll();
}

/**
 * Vraća statistiku keša (za debug/monitoring)
 */
function getCacheStats() {
    return cache.getStats();
}

module.exports = {
    cacheMiddleware,
    invalidateCache,
    invalidateAll,
    getCacheStats
};
