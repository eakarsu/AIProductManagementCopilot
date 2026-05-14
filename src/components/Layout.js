import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCpu, FiLogOut, FiMenu, FiX, FiHome, FiMap, FiLayers, FiBookOpen, FiCalendar, FiUsers, FiSearch, FiTarget, FiBarChart2, FiMessageSquare, FiPackage, FiSliders, FiFileText, FiAlertTriangle, FiClock, FiFlag, FiActivity, FiTrendingUp, FiMail, FiZap, FiTrello, FiGrid } from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/roadmap', label: 'Product Roadmap', icon: FiMap },
  { path: '/features', label: 'Feature Prioritization', icon: FiLayers },
  { path: '/stories', label: 'User Stories', icon: FiBookOpen },
  { path: '/sprints', label: 'Sprint Planning', icon: FiCalendar },
  { path: '/stakeholders', label: 'Stakeholders', icon: FiUsers },
  { path: '/research', label: 'Market Research', icon: FiSearch },
  { path: '/competitors', label: 'Competitive Analysis', icon: FiTarget },
  { path: '/metrics', label: 'Product Metrics', icon: FiBarChart2 },
  { path: '/feedback', label: 'Customer Feedback', icon: FiMessageSquare },
  { path: '/releases', label: 'Releases', icon: FiPackage },
  { path: '/abtests', label: 'A/B Tests', icon: FiSliders },
  { path: '/requirements', label: 'Requirements', icon: FiFileText },
  { path: '/risks', label: 'Risk Assessment', icon: FiAlertTriangle },
  { path: '/capacity', label: 'Team Capacity', icon: FiClock },
  { path: '/okrs', label: 'OKR Tracking', icon: FiFlag },
  { path: '/ai-history', label: 'AI History', icon: FiCpu },
  { path: '/product-health', label: 'Product Health', icon: FiActivity, ai: true },
  { path: '/velocity-chart', label: 'Velocity Chart', icon: FiTrendingUp, ai: true },
  { path: '/competitive-analysis-tool', label: 'Competitor Tool', icon: FiTarget, ai: true },
  { path: '/sprint-planner', label: 'Sprint Planner AI', icon: FiCalendar, ai: true },
  { path: '/release-notes', label: 'Release Notes AI', icon: FiPackage, ai: true },
  { path: '/stakeholder-update', label: 'Stakeholder Update', icon: FiMail, ai: true },
  { path: '/roadmap-gantt', label: 'Roadmap Gantt', icon: FiGrid, ai: true },
  { path: '/sprint-kanban', label: 'Sprint Kanban', icon: FiTrello, ai: true },
  { path: '/okr-tree', label: 'OKR Tree', icon: FiFlag, ai: true },
  { path: '/integrations', label: 'Integrations', icon: FiZap, ai: false },
  { path: '/pm-chat', label: 'PM Chat Agent', icon: FiCpu, ai: true },
  { path: '/sentiment-analyze', label: 'Sentiment Analyze', icon: FiMessageSquare, ai: true },
  { path: '/metric-anomaly-detect', label: 'Metric Anomaly', icon: FiActivity, ai: true },
  { path: '/feature-impact-predict', label: 'Feature Impact', icon: FiZap, ai: true },
  // === Batch 06 Gaps & Frontend Mounts ===
  { path: '/cf-agentic-pm-orchestration', label: 'Agentic PM orchestration', icon: '✨' },
  { path: '/cf-continuous-customer-insight-synthesis', label: 'Continuous customer insight synthesis', icon: '✨' },
  { path: '/cf-roadmap-impact-simulator', label: 'Roadmap impact simulator', icon: '✨' },
  { path: '/cf-stakeholder-storytelling', label: 'Stakeholder storytelling', icon: '✨' },
  { path: '/cf-competitive-threat-detection', label: 'Competitive threat detection', icon: '✨' },
  { path: '/gap-feedback-without-sentiment', label: 'Feedback without `/sentiment', icon: '✨' },
  { path: '/gap-metrics-without-metric', label: 'Metrics without `/metric', icon: '✨' },
  { path: '/gap-features-without-feature', label: 'Features without `/feature', icon: '✨' },
  { path: '/gap-no-frontend-backend', label: 'No frontend (backend', icon: '✨' },
  { path: '/gap-limited-integration-with-analytics-platforms-mixpa', label: 'Limited integration with analytics platforms (Mixpanel, Amplitude)', icon: '✨' },
  { path: '/gap-no-native-jira-linear-sync', label: 'No native Jira/Linear sync', icon: '✨' },
  { path: '/gap-no-native-slack-integration-for-updates', label: 'No native Slack integration for updates', icon: '✨' },
  { path: '/gap-limited-user-research-tools-survey-integration', label: 'Limited user research tools (survey integration)', icon: '✨' },
  { path: '/gap-no-file-upload-for-research-artifacts', label: 'No file upload for research artifacts', icon: '✨' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? '260px' : '0px', padding: sidebarOpen ? '20px 12px' : '0' }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            <FiCpu size={22} color="#3b82f6" />
            <span style={styles.logoText}>PM Copilot</span>
          </div>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ ...styles.main, marginLeft: sidebarOpen ? '260px' : '0' }}>
        <header style={styles.header}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
              <span style={styles.userName}>{user?.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={styles.logoutBtn}>
              <FiLogOut size={18} />
            </button>
          </div>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    background: '#1e293b',
    borderRight: '1px solid #334155',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'all 0.3s ease',
    zIndex: 100,
  },
  sidebarHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #334155',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '8px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    fontFamily: 'inherit',
    width: '100%',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  },
  main: {
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid #334155',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    padding: '24px',
  },
};
