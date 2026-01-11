require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.SERVER_PORT || 3000;

// Import Components
const { validateApiKey } = require('./middleware/authMiddleware');
const { publicApiLimiter, coreApiLimiter } = require('./middleware/rateLimiter');
const { trackUsage } = require('./middleware/usageTracker'); // <-- NEW IMPORT
const errorHandler = require('./middleware/errorHandler');
const authRoute = require('./routes/auth');
const updateLocationRoute = require('./routes/updateLocation');
const withinRadiusRoute = require('./routes/withinRadius');
const usageRoute = require('./routes/usage');

// 1. Global Middleware
app.use(morgan('combined')); // HTTP request logging
app.use(express.json()); // Parse JSON bodies

// 2. Public Routes (Registration)
app.use('/auth', publicApiLimiter, authRoute); // POST /auth/token

// 3. Protected Routes (The Core API)
// All routes below this line require a valid API Key
// Sequence: API Key Validation -> Rate Limiter -> Route Logic -> Usage Tracker
// POST /locations/update
app.use('/locations', validateApiKey, coreApiLimiter, updateLocationRoute, trackUsage);
// POST /locations/nearby
app.use('/locations/nearby', validateApiKey, coreApiLimiter, withinRadiusRoute, trackUsage);


// 4. Usage Stats Route
app.use('/usage', usageRoute);

// 5. Error Handling (Must be last)
app.use(errorHandler);

// 6. Start Server
app.listen(port, () => {
    console.log(`🚀 NodeLoc API running on http://localhost:${port}`);
    console.log(`📡 Ready to accept connections.`);
});