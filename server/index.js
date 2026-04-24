require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/features', require('./routes/features'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/stakeholders', require('./routes/stakeholders'));
app.use('/api/research', require('./routes/research'));
app.use('/api/competitors', require('./routes/competitors'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/releases', require('./routes/releases'));
app.use('/api/abtests', require('./routes/abtests'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/capacity', require('./routes/capacity'));
app.use('/api/okrs', require('./routes/okrs'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PM Copilot server running on port ${PORT}`);
});
