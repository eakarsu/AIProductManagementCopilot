import React, { useState, useEffect, useCallback } from 'react';
import { FiActivity, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiMinus, FiAlertTriangle, FiCheckCircle, FiBarChart2, FiCpu } from 'react-icons/fi';
import { aiProductHealth } from '../services/api';

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B+' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${color}10` }}>
        <span style={{ fontSize: '36px', fontWeight: '800', color }}>{score}</span>
        <span style={{ fontSize: '14px', color, fontWeight: '600' }}>{grade}</span>
      </div>
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Health Score</span>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color: color || '#f1f5f9' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === 'Up' || trend === 'Improving') return <FiTrendingUp color="#10b981" size={16} />;
  if (trend === 'Down' || trend === 'Declining') return <FiTrendingDown color="#ef4444" size={16} />;
  return <FiMinus color="#94a3b8" size={16} />;
}

export default function ProductHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiProductHealth();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load product health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const parsed = data?.parsed;
  const metrics = data?.metrics;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiActivity style={{ marginRight: '10px' }} />Product Health Dashboard</h1>
          <p style={styles.subtitle}>AI-powered product health assessment across all modules</p>
        </div>
        <button onClick={fetchHealth} style={styles.refreshBtn} disabled={loading}>
          <FiRefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Assessing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}><FiAlertTriangle size={16} /> {error}</div>
      )}

      {loading ? (
        <div style={styles.loadingMsg}>
          <FiCpu size={24} style={{ marginBottom: '12px' }} />
          <div>Running AI health assessment...</div>
        </div>
      ) : parsed ? (
        <div style={styles.content}>
          {/* Score + Summary */}
          <div style={styles.topRow}>
            <ScoreBadge score={parsed.health_score || 0} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ ...styles.badge, background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>
                  Velocity: <TrendIcon trend={parsed.velocity_trend} /> {parsed.velocity_trend}
                </span>
                <span style={{ ...styles.badge, background: parsed.risk_level === 'High' ? '#ef444415' : parsed.risk_level === 'Medium' ? '#f59e0b15' : '#10b98115', color: parsed.risk_level === 'High' ? '#ef4444' : parsed.risk_level === 'Medium' ? '#f59e0b' : '#10b981', border: `1px solid ${parsed.risk_level === 'High' ? '#ef444430' : '#10b98130'}` }}>
                  Risk: {parsed.risk_level}
                </span>
                <span style={{ ...styles.badge, background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f630' }}>
                  Delivery: {parsed.delivery_rate || parsed.key_metrics?.story_completion_rate || 0}%
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{parsed.summary}</p>
            </div>
          </div>

          {/* Metrics Row */}
          {metrics && (
            <div style={styles.metricsGrid}>
              <MetricCard label="Total Stories" value={metrics.stories?.total || 0} color="#3b82f6" />
              <MetricCard label="Stories Done" value={metrics.stories?.done || 0} color="#10b981" />
              <MetricCard label="Features Shipped" value={metrics.features?.shipped || 0} color="#8b5cf6" />
              <MetricCard label="Open Risks" value={metrics.risks?.open || 0} color={metrics.risks?.open > 5 ? '#ef4444' : '#f59e0b'} />
              <MetricCard label="Feedback Items" value={metrics.feedback?.total || 0} color="#06b6d4" />
              <MetricCard label="Releases" value={metrics.releases?.released || 0} color="#f97316" />
            </div>
          )}

          {/* Strengths + Concerns */}
          <div style={styles.twoCol}>
            <div style={styles.panel}>
              <h3 style={{ ...styles.panelTitle, color: '#10b981' }}><FiCheckCircle size={16} /> Strengths</h3>
              <ul style={styles.list}>
                {(parsed.strengths || []).map((s, i) => (
                  <li key={i} style={styles.listItem}><span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div style={styles.panel}>
              <h3 style={{ ...styles.panelTitle, color: '#f59e0b' }}><FiAlertTriangle size={16} /> Concerns</h3>
              <ul style={styles.list}>
                {(parsed.concerns || []).map((c, i) => (
                  <li key={i} style={styles.listItem}><span style={{ color: '#f59e0b', marginRight: '8px' }}>!</span>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          {parsed.recommendations?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}><FiBarChart2 size={16} /> AI Recommendations</h3>
              <div style={styles.recGrid}>
                {parsed.recommendations.map((rec, i) => (
                  <div key={i} style={{ ...styles.recCard, borderColor: rec.priority === 'High' ? '#ef4444' : rec.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{rec.action}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: rec.priority === 'High' ? '#ef444420' : '#f59e0b20', color: rec.priority === 'High' ? '#ef4444' : '#f59e0b' }}>
                        {rec.priority}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>{rec.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {parsed.key_metrics && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Key Performance Indicators</h3>
              <div style={styles.kpiGrid}>
                {Object.entries(parsed.key_metrics).map(([key, val]) => (
                  <div key={key} style={styles.kpiItem}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', marginTop: '4px' }}>{typeof val === 'number' ? `${val}%` : val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !error && (
        <div style={styles.emptyMsg}>No health data available. Click Refresh to run assessment.</div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center' },
  subtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '20px' },
  loadingMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#64748b', fontSize: '15px' },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topRow: { display: 'flex', gap: '32px', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '28px', flexWrap: 'wrap' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '14px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { display: 'flex', alignItems: 'flex-start', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' },
  recGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recCard: { padding: '14px', border: '1px solid #334155', borderLeft: '3px solid #334155', borderRadius: '8px', background: '#0f172a' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' },
  kpiItem: { background: '#0f172a', borderRadius: '8px', padding: '14px', border: '1px solid #334155' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  emptyMsg: { textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '15px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
};
