import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMap, FiLayers, FiBookOpen, FiCalendar, FiUsers, FiSearch, FiTarget, FiBarChart2, FiMessageSquare, FiPackage, FiSliders, FiFileText, FiAlertTriangle, FiClock, FiFlag, FiCpu } from 'react-icons/fi';

const features = [
  { path: '/roadmap', label: 'Product Roadmap', icon: FiMap, color: '#3b82f6', desc: 'Plan and visualize your product roadmap across quarters', ai: false },
  { path: '/features', label: 'Feature Prioritization', icon: FiLayers, color: '#8b5cf6', desc: 'AI-powered feature scoring with RICE & MoSCoW frameworks', ai: true },
  { path: '/stories', label: 'User Stories', icon: FiBookOpen, color: '#10b981', desc: 'Generate and manage user stories with AI assistance', ai: true },
  { path: '/sprints', label: 'Sprint Planning', icon: FiCalendar, color: '#f59e0b', desc: 'Plan sprints, set goals, and track velocity', ai: false },
  { path: '/stakeholders', label: 'Stakeholder Management', icon: FiUsers, color: '#ec4899', desc: 'Map stakeholder influence and manage communications', ai: false },
  { path: '/research', label: 'Market Research', icon: FiSearch, color: '#06b6d4', desc: 'AI-driven market analysis with TAM/SAM/SOM insights', ai: true },
  { path: '/competitors', label: 'Competitive Analysis', icon: FiTarget, color: '#ef4444', desc: 'AI competitive intelligence and SWOT analysis', ai: true },
  { path: '/metrics', label: 'Product Metrics & KPIs', icon: FiBarChart2, color: '#14b8a6', desc: 'Track and analyze key product performance metrics', ai: false },
  { path: '/feedback', label: 'Customer Feedback', icon: FiMessageSquare, color: '#a855f7', desc: 'AI sentiment analysis and feedback categorization', ai: true },
  { path: '/releases', label: 'Release Management', icon: FiPackage, color: '#f97316', desc: 'Plan releases, track features and bug fixes', ai: false },
  { path: '/abtests', label: 'A/B Test Planning', icon: FiSliders, color: '#06b6d4', desc: 'Design experiments and track test results', ai: false },
  { path: '/requirements', label: 'Product Requirements', icon: FiFileText, color: '#8b5cf6', desc: 'AI-powered PRD generation and requirements tracking', ai: true },
  { path: '/risks', label: 'Risk Assessment', icon: FiAlertTriangle, color: '#ef4444', desc: 'AI risk analysis with probability and impact scoring', ai: true },
  { path: '/capacity', label: 'Team Capacity', icon: FiClock, color: '#10b981', desc: 'Plan team allocation and manage workload', ai: false },
  { path: '/okrs', label: 'OKR Tracking', icon: FiFlag, color: '#f59e0b', desc: 'Set objectives, track key results and progress', ai: false },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>
            <FiCpu style={{ marginRight: '12px' }} />
            AI Product Management Copilot
          </h1>
          <p style={styles.pageDesc}>Your intelligent companion for building the right products. Powered by AI.</p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderLeft: '3px solid #3b82f6' }}>
          <div style={styles.statValue}>15</div>
          <div style={styles.statLabel}>Modules Available</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '3px solid #8b5cf6' }}>
          <div style={styles.statValue}>8</div>
          <div style={styles.statLabel}>AI-Powered Features</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '3px solid #10b981' }}>
          <div style={styles.statValue}>240+</div>
          <div style={styles.statLabel}>Data Points Seeded</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '3px solid #f59e0b' }}>
          <div style={styles.statValue}>$1.5B</div>
          <div style={styles.statLabel}>PM Tools Market</div>
        </div>
      </div>

      <div style={styles.grid}>
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.path}
              style={styles.card}
              onClick={() => navigate(f.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = f.color;
                e.currentTarget.style.boxShadow = `0 8px 25px -5px ${f.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconWrap, background: `${f.color}15`, color: f.color }}>
                  <Icon size={24} />
                </div>
                {f.ai && (
                  <span style={styles.aiBadge}>
                    <FiCpu size={12} /> AI
                  </span>
                )}
              </div>
              <h3 style={styles.cardTitle}>{f.label}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  headerSection: {
    marginBottom: '28px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  pageDesc: {
    color: '#94a3b8',
    fontSize: '15px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid #334155',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#a78bfa',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },
};
