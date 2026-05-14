# Audit Note — AIProductManagementCopilot

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_06.md` section #35.

## Original Recommendations

### Gaps — AI Counterparts
- `/sentiment-analyze` (added)
- `/metric-anomaly-detect` (added)
- `/feature-impact-predict` (added)

### Gaps — Non-AI Features
- Mixpanel/Amplitude integration
- Jira/Linear integration
- Slack integration
- Survey integration

### Custom Feature Suggestions
1. Agentic PM orchestration
2. Continuous customer-insight synthesis
3. Roadmap impact simulator
4. Stakeholder storytelling
5. Competitive threat detection

## Implemented (Mechanical)
- `POST /api/ai/sentiment-analyze` — added in `server/routes/ai.js`. Per-item + aggregate sentiment with themes and recommendations. Persists via `persistAIResult`.
- `POST /api/ai/metric-anomaly-detect` — added in `server/routes/ai.js`. Pulls a metric series by `metric_id` (or accepts inline) and returns anomalies (spike/drop/level-shift/seasonality-break) with severity.
- `POST /api/ai/feature-impact-predict` — added in `server/routes/ai.js`. Pulls feature record (or inline desc), returns predicted impact, KPIs, risks, experiment design, build/defer/reject recommendation.

All three follow existing `callOpenRouter`/`persistAIResult`/`auth`/`aiRateLimiter` style.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- Analytics platforms (Mixpanel, Amplitude API).
- Jira/Linear OAuth.
- Slack OAuth + bot framework.
- Survey integrations (Typeform, SurveyMonkey).

### NEEDS-PRODUCT-DECISION
- Agentic PM orchestrator (multi-step workflow infra).
- Roadmap simulator UI/data model.
- Real-time competitive threat monitor (data sources + scraping policy).

### TOO-RISKY
- Auto-execute roadmap changes from AI recommendations.
- Auto-respond to stakeholder messages.

## Apply pass 3 (frontend)

LEFT-AS-IS. `src/pages/SentimentAnalyzePage.js`, `src/pages/MetricAnomalyDetectPage.js`, and `src/pages/FeatureImpactPredictPage.js` already call the three apply2 endpoints via the shared axios `API` instance in `src/services/api.js` (Bearer-token interceptor reads `localStorage.getItem('token')`; 401 clears storage and redirects to login). All three routes are registered in `src/App.js`. Backend errors (including 503 no-key) surface via `err.response?.data?.error`. No FE files changed in this pass.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. No mechanical backlog items remain. The original audit's three missing AI counterparts (`/sentiment-analyze`, `/metric-anomaly-detect`, `/feature-impact-predict`) were closed in pass 2; FE pages verified in pass 3. Existing AI surface: 13 POST endpoints + `/history` and `/product-health` in `server/routes/ai.js`. All remaining items in this audit note are deferred for explicit reasons:
- Mixpanel/Amplitude analytics integration — NEEDS-CREDS.
- Jira/Linear OAuth — NEEDS-CREDS.
- Slack OAuth + bot framework — NEEDS-CREDS.
- Survey integrations (Typeform, SurveyMonkey) — NEEDS-CREDS.
- Agentic PM orchestrator (multi-step workflow infra) — NEEDS-PRODUCT-DECISION.
- Roadmap impact simulator (UI/data model) — NEEDS-PRODUCT-DECISION.
- Real-time competitive threat monitor (data sources + scraping policy) — NEEDS-PRODUCT-DECISION.
- Auto-execute roadmap changes from AI recommendations — TOO-RISKY.
- Auto-respond to stakeholder messages — TOO-RISKY.

No code changes. No smoke test (no code change).
