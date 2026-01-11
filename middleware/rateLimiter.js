const rateLimit = require('express-rate-limit');

// 1. PUBLIC Limiter (For the /auth/token route)
// Protects against mass registration attempts from one IP.
exports.publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        error: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. CORE Limiter (For the /locations routes)
// This is critical. It limits ALL users (per API key) to 1000 requests per minute.
exports.coreApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // 1000 requests per minute per key
    message: {
        status: 429,
        error: "Rate limit exceeded. Too many requests. Please check your plan limits."
    },
    // CRITICAL FIX: Use ipKeyGenerator as a fallback for the API key ID
    keyGenerator: (req, res) => {
        // If the client is authenticated (req.client exists), use their user_id.
        if (req.client) {
            return req.client.id.toString(); 
        }
        // If validation failed or the key is missing/invalid, fallback to a safe IP-based key.
        // This ensures the request still hits a limit based on the client's IP address.
        return rateLimit.ipKeyGenerator(req, res); // <-- RECOMMENDED FIX APPLIED
    },
    standardHeaders: true,
    legacyHeaders: false,
});
