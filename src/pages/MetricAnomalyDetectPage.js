import React, { useState } from 'react';
import { FiActivity, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import API from '../services/api';

function safeParseJSON(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export default function MetricAnomalyDetectPage() {
  const [metricId, setMetricId] = useState('');
  const [seriesText, setSeriesText] = useState(
    '[\n  {"date":"2025-04-01","value":120},\n  {"date":"2025-04-02","value":118}\n]'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {};
      if (metricId) payload.metric_id = metricId;
      if (seriesText.trim()) {
        const parsed = safeParseJSON(seriesText.trim(), null);
        if (Array.isArray(parsed)) payload.series = parsed;
        else payload.series_text = seriesText.trim();
      }
      const res = await API.post('/ai/metric-anomaly-detect', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed;
  const anomalies = parsed?.anomalies || [];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiActivity style={{ marginRight: 10 }} />
            Metric Anomaly Detector
          </h1>
          <p style={styles.subtitle}>Spike, drop, level-shift, seasonality-break detection</p>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Input</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={styles.label}>Metric ID (optional)</label>
          <input
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            style={styles.input}
            placeholder="Server pulls series by ID"
          />
        </div>
        <div>
          <label style={styles.label}>Inline Series (JSON array)</label>
          <textarea
            value={seriesText}
            onChange={(e) => setSeriesText(e.target.value)}
            rows={6}
            style={{ ...styles.textarea, fontFamily: 'monospace' }}
          />
        </div>
        <button onClick={handleSubmit} style={styles.generateBtn} disabled={loading}>
          <FiCpu size={16} /> {loading ? 'Detecting...' : 'Detect Anomalies'}
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <FiAlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div style={styles.loadingMsg}>
          <FiCpu size={24} style={{ marginBottom: 12 }} />
          <div>Scanning the time series...</div>
        </div>
      )}

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {anomalies.length === 0 ? (
            <div style={{ ...styles.panel, background: '#10b98108', border: '1px solid #10b98130' }}>
              <p style={{ color: '#a7f3d0' }}>No anomalies detected.</p>
            </div>
          ) : (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Anomalies ({anomalies.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>
                    <th style={{ padding: 6 }}>Date</th>
                    <th style={{ padding: 6 }}>Type</th>
                    <th style={{ padding: 6 }}>Severity</th>
                    <th style={{ padding: 6 }}>Value</th>
                    <th style={{ padding: 6 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: '1px solid #334155', fontSize: 13, color: '#cbd5e1' }}
                    >
                      <td style={{ padding: 6 }}>{a.date || a.period || '-'}</td>
                      <td style={{ padding: 6 }}>{a.type || a.category || '-'}</td>
                      <td style={{ padding: 6 }}>{a.severity || '-'}</td>
                      <td style={{ padding: 6 }}>{a.value ?? '-'}</td>
                      <td style={{ padding: 6 }}>{a.description || a.reason || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {parsed.summary && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Summary</h3>
              <p style={{ color: '#cbd5e1' }}>
                {typeof parsed.summary === 'string' ? parsed.summary : JSON.stringify(parsed.summary)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center' },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 4 },
  formCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  formTitle: { fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 20px',
    background: 'rgba(236,72,153,0.1)',
    color: '#f472b6',
    border: '1px solid rgba(236,72,153,0.3)',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    marginTop: 16,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: '#ef444420',
    border: '1px solid #ef444430',
    borderRadius: 8,
    color: '#ef4444',
    marginBottom: 16,
  },
  loadingMsg: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    color: '#64748b',
    fontSize: 15,
  },
  panel: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 18 },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#f1f5f9',
    marginBottom: 12,
  },
};
