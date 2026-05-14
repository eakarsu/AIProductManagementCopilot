import React, { useState } from 'react';
import { FiTarget, FiPlus, FiX, FiCpu, FiShield, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { aiCompetitiveAnalysis } from '../services/api';

export default function CompetitiveAnalysisPage() {
  const [competitors, setCompetitors] = useState(['']);
  const [product, setProduct] = useState('');
  const [market, setMarket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const addCompetitor = () => setCompetitors([...competitors, '']);
  const removeCompetitor = (i) => setCompetitors(competitors.filter((_, idx) => idx !== i));
  const updateCompetitor = (i, val) => setCompetitors(competitors.map((c, idx) => idx === i ? val : c));

  const handleAnalyze = async () => {
    const names = competitors.filter(c => c.trim());
    if (!names.length) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await aiCompetitiveAnalysis({ competitors: names, product, market });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const parsed = result?.parsed;

  const threatColor = (level) => {
    const map = { 'Critical': '#ef4444', 'High': '#f97316', 'Medium': '#f59e0b', 'Low': '#10b981' };
    return map[level] || '#94a3b8';
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiTarget style={{ marginRight: '10px' }} />Competitive Analysis</h1>
          <p style={styles.subtitle}>AI-powered competitor matrix with features, weaknesses and opportunities</p>
        </div>
      </div>

      {/* Input Form */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Configure Analysis</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Our Product Name</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              style={styles.input}
              placeholder="e.g., AI PM Copilot"
            />
          </div>
          <div>
            <label style={styles.label}>Market / Category</label>
            <input
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              style={styles.input}
              placeholder="e.g., Product Management Software"
            />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Competitors</label>
          {competitors.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                value={c}
                onChange={(e) => updateCompetitor(i, e.target.value)}
                style={{ ...styles.input, flex: 1 }}
                placeholder={`Competitor ${i + 1} (e.g., Jira, Asana)`}
              />
              {competitors.length > 1 && (
                <button onClick={() => removeCompetitor(i)} style={styles.removeBtn}><FiX size={16} /></button>
              )}
            </div>
          ))}
          <button onClick={addCompetitor} style={styles.addBtn}>
            <FiPlus size={14} /> Add Competitor
          </button>
        </div>
        <button
          onClick={handleAnalyze}
          style={styles.analyzeBtn}
          disabled={loading || !competitors.filter(c => c.trim()).length}
        >
          <FiCpu size={16} /> {loading ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </div>

      {error && <div style={styles.errorBox}><FiAlertTriangle size={16} /> {error}</div>}

      {loading && <div style={styles.loadingMsg}><FiCpu size={24} style={{ marginBottom: '12px' }} /><div>Running competitive intelligence analysis...</div></div>}

      {parsed && (
        <div style={styles.results}>
          {/* Market Positioning */}
          {parsed.market_positioning && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Market Positioning</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{parsed.market_positioning}</p>
            </div>
          )}

          {/* Competitor Matrix */}
          {parsed.matrix?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Competitor Matrix</h3>
              <div style={styles.matrixGrid}>
                {parsed.matrix.map((comp, i) => (
                  <div key={i} style={{ ...styles.compCard, borderTop: `3px solid ${threatColor(comp.threat_level)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{comp.competitor}</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {comp.pricing && <span style={styles.smallBadge}>{comp.pricing}</span>}
                        <span style={{ ...styles.smallBadge, background: `${threatColor(comp.threat_level)}15`, color: threatColor(comp.threat_level) }}>
                          {comp.threat_level} Threat
                        </span>
                      </div>
                    </div>

                    {comp.market_share && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                        Market Share: <span style={{ color: '#94a3b8' }}>{comp.market_share}</span>
                      </div>
                    )}

                    <div style={styles.compSection}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>Strengths</div>
                      <ul style={styles.compList}>
                        {(comp.strengths || []).slice(0, 3).map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>

                    <div style={styles.compSection}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>Weaknesses</div>
                      <ul style={styles.compList}>
                        {(comp.weaknesses || []).slice(0, 3).map((w, j) => <li key={j}>{w}</li>)}
                      </ul>
                    </div>

                    {comp.opportunities?.length > 0 && (
                      <div style={styles.compSection}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>Opportunities</div>
                        <ul style={styles.compList}>
                          {comp.opportunities.slice(0, 2).map((o, j) => <li key={j}>{o}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SWOT */}
          {parsed.swot && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>SWOT Analysis (Our Product)</h3>
              <div style={styles.swotGrid}>
                {[
                  { key: 'strengths', label: 'Strengths', color: '#10b981' },
                  { key: 'weaknesses', label: 'Weaknesses', color: '#ef4444' },
                  { key: 'opportunities', label: 'Opportunities', color: '#3b82f6' },
                  { key: 'threats', label: 'Threats', color: '#f59e0b' },
                ].map(({ key, label, color }) => (
                  <div key={key} style={{ ...styles.swotCard, borderTop: `3px solid ${color}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color, marginBottom: '8px' }}>{label}</div>
                    <ul style={styles.compList}>
                      {(parsed.swot[key] || []).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Our Advantages + Gaps */}
          <div style={styles.twoCol}>
            {parsed.our_advantages?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.panelTitle, color: '#10b981' }}><FiShield size={16} /> Our Advantages</h3>
                <ul style={styles.compList}>
                  {parsed.our_advantages.map((a, i) => (
                    <li key={i} style={{ marginBottom: '6px', color: '#cbd5e1', fontSize: '13px' }}>✓ {a}</li>
                  ))}
                </ul>
              </div>
            )}
            {parsed.our_gaps?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.panelTitle, color: '#f59e0b' }}><FiAlertTriangle size={16} /> Our Gaps</h3>
                <ul style={styles.compList}>
                  {parsed.our_gaps.map((g, i) => (
                    <li key={i} style={{ marginBottom: '6px', color: '#cbd5e1', fontSize: '13px' }}>⚠ {g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Strategic Recommendations */}
          {parsed.strategic_recommendations?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}><FiTrendingUp size={16} /> Strategic Recommendations</h3>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {parsed.strategic_recommendations.map((r, i) => (
                  <li key={i} style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>{r}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Differentiation Strategy */}
          {parsed.differentiation_strategy && (
            <div style={{ ...styles.panel, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 style={{ ...styles.panelTitle, color: '#3b82f6' }}>Differentiation Strategy</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{parsed.differentiation_strategy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center' },
  subtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px' },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  formTitle: { fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  removeBtn: { padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', border: '1px dashed #334155', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', marginTop: '4px' },
  analyzeBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', marginTop: '20px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  loadingMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#64748b', fontSize: '15px' },
  results: { display: 'flex', flexDirection: 'column', gap: '20px' },
  panel: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '14px' },
  matrixGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
  compCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' },
  compSection: { marginBottom: '10px' },
  compList: { listStyle: 'none', padding: 0, margin: 0 },
  smallBadge: { padding: '2px 8px', borderRadius: '20px', fontSize: '11px', background: '#334155', color: '#94a3b8' },
  swotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  swotCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '14px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
};
