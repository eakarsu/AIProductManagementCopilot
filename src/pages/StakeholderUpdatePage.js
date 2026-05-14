import React, { useState } from 'react';
import { FiUsers, FiCpu, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiCalendar, FiCopy, FiCheck } from 'react-icons/fi';
import { aiStakeholderUpdate } from '../services/api';

export default function StakeholderUpdatePage() {
  const [period, setPeriod] = useState('Q2 2025');
  const [audience, setAudience] = useState('Leadership');
  const [highlights, setHighlights] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setResult(null);
    try {
      const res = await aiStakeholderUpdate({ period, audience, highlights });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const parsed = result?.parsed;
    if (!parsed) return;
    const text = [
      `Subject: ${parsed.subject}`,
      '',
      `## Executive Summary`,
      parsed.executive_summary,
      '',
      parsed.key_achievements?.length > 0 ? `## Key Achievements\n${parsed.key_achievements.map(a => `- ${a}`).join('\n')}` : '',
      '',
      parsed.upcoming_milestones?.length > 0 ? `## Upcoming Milestones\n${parsed.upcoming_milestones.map(m => `- ${m}`).join('\n')}` : '',
      '',
      parsed.risks_and_blockers?.length > 0 ? `## Risks & Blockers\n${parsed.risks_and_blockers.map(r => `- ${r}`).join('\n')}` : '',
      '',
      parsed.decisions_needed?.length > 0 ? `## Decisions Needed\n${parsed.decisions_needed.map(d => `- ${d}`).join('\n')}` : '',
      '',
      parsed.next_period_focus ? `## Next Period Focus\n${parsed.next_period_focus}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const parsed = result?.parsed;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiUsers style={{ marginRight: '10px' }} />Stakeholder Update Generator</h1>
          <p style={styles.subtitle}>AI-generated executive summaries for leadership communication</p>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Configure Update</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Period / Timeframe</label>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={styles.input}
              placeholder="e.g., Q2 2025, Sprint 14"
            />
          </div>
          <div>
            <label style={styles.label}>Target Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} style={styles.select}>
              <option value="Leadership">Leadership</option>
              <option value="Board">Board of Directors</option>
              <option value="Investors">Investors</option>
              <option value="Engineering">Engineering Team</option>
              <option value="Sales">Sales Team</option>
              <option value="All Stakeholders">All Stakeholders</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={styles.label}>Additional Highlights (Optional)</label>
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            style={styles.textarea}
            placeholder="Any specific achievements or context to include..."
            rows={3}
          />
        </div>
        <button onClick={handleGenerate} style={styles.generateBtn} disabled={generating}>
          <FiCpu size={16} /> {generating ? 'Generating...' : 'Generate Executive Update'}
        </button>
      </div>

      {error && <div style={styles.errorBox}><FiAlertTriangle size={16} /> {error}</div>}

      {generating && (
        <div style={styles.loadingMsg}>
          <FiCpu size={24} style={{ marginBottom: '12px' }} />
          <div>Gathering project metrics and generating executive update...</div>
        </div>
      )}

      {parsed && (
        <div style={styles.updateContainer}>
          {/* Email Header */}
          <div style={styles.emailHeader}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>{parsed.subject}</div>
            </div>
            <button onClick={handleCopy} style={styles.copyBtn}>
              {copied ? <><FiCheck size={14} /> Copied!</> : <><FiCopy size={14} /> Copy</>}
            </button>
          </div>

          {/* Executive Summary */}
          {parsed.executive_summary && (
            <div style={styles.execSummary}>
              <h3 style={styles.sectionTitle}>Executive Summary</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>{parsed.executive_summary}</p>
            </div>
          )}

          <div style={styles.twoCol}>
            {/* Key Achievements */}
            {parsed.key_achievements?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.sectionTitle, color: '#10b981' }}><FiCheckCircle size={14} /> Key Achievements</h3>
                <ul style={styles.bulletList}>
                  {parsed.key_achievements.map((a, i) => (
                    <li key={i} style={styles.bulletItem}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics Highlights */}
            {parsed.metrics_highlights?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.sectionTitle, color: '#3b82f6' }}><FiTrendingUp size={14} /> Metrics Highlights</h3>
                {parsed.metrics_highlights.map((m, i) => (
                  <div key={i} style={styles.metricItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500' }}>{m.metric}</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: m.trend === 'Up' ? '#10b981' : m.trend === 'Down' ? '#ef4444' : '#94a3b8' }}>{m.value}</span>
                    </div>
                    {m.context && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{m.context}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.twoCol}>
            {/* Upcoming Milestones */}
            {parsed.upcoming_milestones?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.sectionTitle, color: '#f59e0b' }}><FiCalendar size={14} /> Upcoming Milestones</h3>
                <ul style={styles.bulletList}>
                  {parsed.upcoming_milestones.map((m, i) => (
                    <li key={i} style={styles.bulletItem}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks & Blockers */}
            {parsed.risks_and_blockers?.length > 0 && (
              <div style={styles.panel}>
                <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}><FiAlertTriangle size={14} /> Risks & Blockers</h3>
                <ul style={styles.bulletList}>
                  {parsed.risks_and_blockers.map((r, i) => (
                    <li key={i} style={{ ...styles.bulletItem, color: '#fca5a5' }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Decisions Needed */}
          {parsed.decisions_needed?.length > 0 && (
            <div style={{ ...styles.panel, background: '#f59e0b08', border: '1px solid #f59e0b30' }}>
              <h3 style={{ ...styles.sectionTitle, color: '#f59e0b' }}>Decisions Needed</h3>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {parsed.decisions_needed.map((d, i) => (
                  <li key={i} style={{ color: '#fbbf24', fontSize: '13px', marginBottom: '6px', lineHeight: '1.5' }}>{d}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Team Highlights */}
          {parsed.team_highlights && (
            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Team Highlights</h3>
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>{parsed.team_highlights}</p>
            </div>
          )}

          {/* Next Period Focus */}
          {parsed.next_period_focus && (
            <div style={{ ...styles.panel, background: '#3b82f608', border: '1px solid #3b82f630' }}>
              <h3 style={{ ...styles.sectionTitle, color: '#3b82f6' }}>Next Period Focus</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{parsed.next_period_focus}</p>
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
  select: { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
  generateBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: 'rgba(236,72,153,0.1)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', marginTop: '16px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  loadingMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#64748b', fontSize: '15px' },
  updateContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  emailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', flexWrap: 'wrap', gap: '12px' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  execSummary: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' },
  bulletList: { paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' },
  bulletItem: { color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' },
  metricItem: { padding: '8px 0', borderBottom: '1px solid #334155' },
};
