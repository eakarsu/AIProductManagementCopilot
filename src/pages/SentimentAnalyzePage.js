import React, { useState } from 'react';
import { FiHeart, FiCpu, FiAlertTriangle } from 'react-icons/fi';
import API from '../services/api';

export default function SentimentAnalyzePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const blocks = text
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { items: blocks.length > 1 ? blocks : [text.trim()] };
      const res = await API.post('/ai/sentiment-analyze', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed;
  const items = parsed?.items || parsed?.per_item || [];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiHeart style={{ marginRight: 10 }} />
            Sentiment Analyzer
          </h1>
          <p style={styles.subtitle}>Per-item + aggregate sentiment with themes and recommendations</p>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Feedback Items</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
          rows={10}
          placeholder="Paste feedback items (separate with blank lines for per-item scoring)"
          required
        />
        <button onClick={handleSubmit} style={styles.generateBtn} disabled={loading || !text.trim()}>
          <FiCpu size={16} /> {loading ? 'Analyzing...' : 'Analyze Sentiment'}
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
          <div>Reading the room...</div>
        </div>
      )}

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parsed.aggregate_sentiment && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Aggregate Sentiment</h3>
              <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>
                {typeof parsed.aggregate_sentiment === 'string'
                  ? parsed.aggregate_sentiment
                  : JSON.stringify(parsed.aggregate_sentiment)}
              </p>
            </div>
          )}
          {parsed.themes?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={{ ...styles.sectionTitle, color: '#3b82f6' }}>Themes</h3>
              <ul style={styles.bulletList}>
                {parsed.themes.map((t, i) => (
                  <li key={i} style={styles.bulletItem}>
                    {typeof t === 'string' ? t : JSON.stringify(t)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parsed.recommendations?.length > 0 && (
            <div style={{ ...styles.panel, background: '#10b98108', border: '1px solid #10b98130' }}>
              <h3 style={{ ...styles.sectionTitle, color: '#10b981' }}>Recommendations</h3>
              <ul style={styles.bulletList}>
                {parsed.recommendations.map((r, i) => (
                  <li key={i} style={styles.bulletItem}>
                    {typeof r === 'string' ? r : JSON.stringify(r)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {items.length > 0 && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Per-Item Sentiment</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>
                    <th style={{ padding: 6 }}>#</th>
                    <th style={{ padding: 6 }}>Sentiment</th>
                    <th style={{ padding: 6 }}>Score</th>
                    <th style={{ padding: 6 }}>Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #334155', fontSize: 13, color: '#cbd5e1' }}>
                      <td style={{ padding: 6 }}>{i + 1}</td>
                      <td style={{ padding: 6 }}>{it.sentiment || '-'}</td>
                      <td style={{ padding: 6 }}>{it.score ?? '-'}</td>
                      <td style={{ padding: 6, maxWidth: 400 }}>{it.text || it.item || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
