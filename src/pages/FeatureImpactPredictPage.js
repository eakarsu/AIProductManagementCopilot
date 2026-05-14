import React, { useState } from 'react';
import { FiZap, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import API from '../services/api';

export default function FeatureImpactPredictPage() {
  const [featureId, setFeatureId] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!featureId && !description.trim()) {
      setError('Provide a feature_id or description');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {};
      if (featureId) payload.feature_id = featureId;
      if (description) payload.description = description;
      if (audience) payload.audience = audience;
      if (businessGoal) payload.business_goal = businessGoal;
      const res = await API.post('/ai/feature-impact-predict', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiZap style={{ marginRight: 10 }} />
            Feature Impact Predictor
          </h1>
          <p style={styles.subtitle}>
            Predict impact, KPIs, risks, experiment design, and build/defer/reject recommendation
          </p>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Feature</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Feature ID (optional)</label>
            <input
              value={featureId}
              onChange={(e) => setFeatureId(e.target.value)}
              style={styles.input}
              placeholder="Server pulls record by ID"
            />
          </div>
          <div>
            <label style={styles.label}>Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={styles.input}
              placeholder="e.g., enterprise admins"
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={styles.label}>Business Goal</label>
          <input
            value={businessGoal}
            onChange={(e) => setBusinessGoal(e.target.value)}
            style={styles.input}
            placeholder="e.g., reduce churn, increase activation"
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={styles.label}>Feature Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            rows={5}
            placeholder="Describe the feature, problem solved, scope..."
          />
        </div>
        <button onClick={handleSubmit} style={styles.generateBtn} disabled={loading}>
          <FiCpu size={16} /> {loading ? 'Predicting...' : 'Predict Impact'}
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
          <div>Modeling impact...</div>
        </div>
      )}

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parsed.recommendation && (
            <div
              style={{
                ...styles.panel,
                background:
                  String(parsed.recommendation).toLowerCase().includes('build') || parsed.recommendation === 'BUILD'
                    ? '#10b98108'
                    : '#f59e0b08',
                border:
                  String(parsed.recommendation).toLowerCase().includes('build') || parsed.recommendation === 'BUILD'
                    ? '1px solid #10b98130'
                    : '1px solid #f59e0b30',
              }}
            >
              <h3 style={styles.sectionTitle}>Recommendation</h3>
              <p style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>
                {String(parsed.recommendation).toUpperCase()}
              </p>
              {parsed.recommendation_rationale && (
                <p style={{ color: '#cbd5e1', fontSize: 13 }}>{parsed.recommendation_rationale}</p>
              )}
            </div>
          )}

          {parsed.predicted_impact && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Predicted Impact</h3>
              <p style={{ color: '#cbd5e1' }}>
                {typeof parsed.predicted_impact === 'string'
                  ? parsed.predicted_impact
                  : JSON.stringify(parsed.predicted_impact, null, 2)}
              </p>
            </div>
          )}

          {parsed.kpis?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={{ ...styles.sectionTitle, color: '#3b82f6' }}>Target KPIs</h3>
              <ul style={styles.bulletList}>
                {parsed.kpis.map((k, i) => (
                  <li key={i} style={styles.bulletItem}>
                    {typeof k === 'string' ? k : JSON.stringify(k)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsed.risks?.length > 0 && (
            <div style={{ ...styles.panel, background: '#ef444408', border: '1px solid #ef444430' }}>
              <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}>Risks</h3>
              <ul style={styles.bulletList}>
                {parsed.risks.map((r, i) => (
                  <li key={i} style={{ ...styles.bulletItem, color: '#fca5a5' }}>
                    {typeof r === 'string' ? r : JSON.stringify(r)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsed.experiment_design && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Experiment Design</h3>
              <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {typeof parsed.experiment_design === 'string'
                  ? parsed.experiment_design
                  : JSON.stringify(parsed.experiment_design, null, 2)}
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
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
    fontFamily: 'inherit',
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
  bulletList: { paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  bulletItem: { color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 },
};
