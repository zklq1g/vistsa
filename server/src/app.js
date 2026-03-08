const express = require('express');
const cors = require('cors');

// Routers
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const projectRoutes = require('./routes/project.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const eventRoutes = require('./routes/event.routes');
const studyRoutes = require('./routes/study.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'VISTA API is running smoothly.' });
});

// 404 catch-all for unknown API routes
app.use('/api/*path', (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
