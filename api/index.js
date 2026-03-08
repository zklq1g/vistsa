try {
    require('dotenv').config();
    console.log('[VISTA] Loading server app...');
    console.log('[VISTA] DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.log('[VISTA] JWT_SECRET set:', !!process.env.JWT_SECRET);
    const app = require('../server/src/app');
    console.log('[VISTA] Server app loaded successfully.');
    module.exports = app;
} catch (err) {
    console.error('[VISTA] FATAL: Failed to load server app:', err.message);
    console.error('[VISTA] Stack:', err.stack);

    // Return a diagnostic handler so we can see the error in the browser too
    module.exports = (req, res) => {
        res.status(500).json({
            success: false,
            message: 'Server failed to initialize.',
            error: err.message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
        });
    };
}
