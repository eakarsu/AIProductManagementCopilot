import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIHistoryPage from './pages/AIHistoryPage';
import ProductHealthPage from './pages/ProductHealthPage';
import VelocityChartPage from './pages/VelocityChartPage';
import CompetitiveAnalysisPage from './pages/CompetitiveAnalysisPage';
import SprintPlannerPage from './pages/SprintPlannerPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';
import StakeholderUpdatePage from './pages/StakeholderUpdatePage';
import RoadmapGanttPage from './pages/RoadmapGanttPage';
import SprintKanbanPage from './pages/SprintKanbanPage';
import OKRTreePage from './pages/OKRTreePage';
import IntegrationsPage from './pages/IntegrationsPage';
import PMChatAgent from './pages/PMChatAgent';
import SentimentAnalyzePage from './pages/SentimentAnalyzePage';
import MetricAnomalyDetectPage from './pages/MetricAnomalyDetectPage';
import FeatureImpactPredictPage from './pages/FeatureImpactPredictPage';
import Layout from './components/Layout';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFAgenticPmOrchestrationPage from './pages/CFAgenticPmOrchestrationPage';
import CFContinuousCustomerInsightSynthesisPage from './pages/CFContinuousCustomerInsightSynthesisPage';
import CFRoadmapImpactSimulatorPage from './pages/CFRoadmapImpactSimulatorPage';
import CFStakeholderStorytellingPage from './pages/CFStakeholderStorytellingPage';
import CFCompetitiveThreatDetectionPage from './pages/CFCompetitiveThreatDetectionPage';
import GapFeedbackWithoutSentimentPage from './pages/GapFeedbackWithoutSentimentPage';
import GapMetricsWithoutMetricPage from './pages/GapMetricsWithoutMetricPage';
import GapFeaturesWithoutFeaturePage from './pages/GapFeaturesWithoutFeaturePage';
import GapNoFrontendBackendPage from './pages/GapNoFrontendBackendPage';
import GapLimitedIntegrationWithAnalyticsPlatformsMixpaPage from './pages/GapLimitedIntegrationWithAnalyticsPlatformsMixpaPage';
import GapNoNativeJiraLinearSyncPage from './pages/GapNoNativeJiraLinearSyncPage';
import GapNoNativeSlackIntegrationForUpdatesPage from './pages/GapNoNativeSlackIntegrationForUpdatesPage';
import GapLimitedUserResearchToolsSurveyIntegrationPage from './pages/GapLimitedUserResearchToolsSurveyIntegrationPage';
import GapNoFileUploadForResearchArtifactsPage from './pages/GapNoFileUploadForResearchArtifactsPage';
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="ai-history" element={<AIHistoryPage />} />
          <Route path="product-health" element={<ProductHealthPage />} />
          <Route path="velocity-chart" element={<VelocityChartPage />} />
          <Route path="competitive-analysis-tool" element={<CompetitiveAnalysisPage />} />
          <Route path="sprint-planner" element={<SprintPlannerPage />} />
          <Route path="release-notes" element={<ReleaseNotesPage />} />
          <Route path="stakeholder-update" element={<StakeholderUpdatePage />} />
          <Route path="roadmap-gantt" element={<RoadmapGanttPage />} />
          <Route path="sprint-kanban" element={<SprintKanbanPage />} />
          <Route path="okr-tree" element={<OKRTreePage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="pm-chat" element={<PMChatAgent />} />
          <Route path="sentiment-analyze" element={<SentimentAnalyzePage />} />
          <Route path="metric-anomaly-detect" element={<MetricAnomalyDetectPage />} />
          <Route path="feature-impact-predict" element={<FeatureImpactPredictPage />} />
          <Route path=":feature" element={<FeaturePage />} />
        </Route>
      
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-pm-orchestration" element={<CFAgenticPmOrchestrationPage />} />
          <Route path="/cf-continuous-customer-insight-synthesis" element={<CFContinuousCustomerInsightSynthesisPage />} />
          <Route path="/cf-roadmap-impact-simulator" element={<CFRoadmapImpactSimulatorPage />} />
          <Route path="/cf-stakeholder-storytelling" element={<CFStakeholderStorytellingPage />} />
          <Route path="/cf-competitive-threat-detection" element={<CFCompetitiveThreatDetectionPage />} />
          <Route path="/gap-feedback-without-sentiment" element={<GapFeedbackWithoutSentimentPage />} />
          <Route path="/gap-metrics-without-metric" element={<GapMetricsWithoutMetricPage />} />
          <Route path="/gap-features-without-feature" element={<GapFeaturesWithoutFeaturePage />} />
          <Route path="/gap-no-frontend-backend" element={<GapNoFrontendBackendPage />} />
          <Route path="/gap-limited-integration-with-analytics-platforms-mixpa" element={<GapLimitedIntegrationWithAnalyticsPlatformsMixpaPage />} />
          <Route path="/gap-no-native-jira-linear-sync" element={<GapNoNativeJiraLinearSyncPage />} />
          <Route path="/gap-no-native-slack-integration-for-updates" element={<GapNoNativeSlackIntegrationForUpdatesPage />} />
          <Route path="/gap-limited-user-research-tools-survey-integration" element={<GapLimitedUserResearchToolsSurveyIntegrationPage />} />
          <Route path="/gap-no-file-upload-for-research-artifacts" element={<GapNoFileUploadForResearchArtifactsPage />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;
