require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
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


// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-agentic-pm-orchestration', require('./routes/customFeat01_AgenticPmOrchestration'));
app.use('/api/cf-continuous-customer-insight-synthesis', require('./routes/customFeat02_ContinuousCustomerInsightSynthesis'));
app.use('/api/cf-roadmap-impact-simulator', require('./routes/customFeat03_RoadmapImpactSimulator'));
app.use('/api/cf-stakeholder-storytelling', require('./routes/customFeat04_StakeholderStorytelling'));
app.use('/api/cf-competitive-threat-detection', require('./routes/customFeat05_CompetitiveThreatDetection'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-feedback-without-sentiment', require('./routes/gapFeat_feedback_without_sentiment'));
app.use('/api/gap-metrics-without-metric', require('./routes/gapFeat_metrics_without_metric'));
app.use('/api/gap-features-without-feature', require('./routes/gapFeat_features_without_feature'));
app.use('/api/gap-no-frontend-backend', require('./routes/gapFeat_no_frontend_backend'));
app.use('/api/gap-limited-integration-with-analytics-platforms-mixpa', require('./routes/gapFeat_limited_integration_with_analytics_platforms_mixpa'));
app.use('/api/gap-no-native-jira-linear-sync', require('./routes/gapFeat_no_native_jira_linear_sync'));
app.use('/api/gap-no-native-slack-integration-for-updates', require('./routes/gapFeat_no_native_slack_integration_for_updates'));
app.use('/api/gap-limited-user-research-tools-survey-integration', require('./routes/gapFeat_limited_user_research_tools_survey_integration'));
app.use('/api/gap-no-file-upload-for-research-artifacts', require('./routes/gapFeat_no_file_upload_for_research_artifacts'));

app.listen(PORT, () => {
  console.log(`PM Copilot server running on port ${PORT}`);
});
