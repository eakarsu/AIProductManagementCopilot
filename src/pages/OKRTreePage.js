import React, { useState, useEffect } from 'react';
import { FiFlag, FiCpu, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { okrsAPI, aiGenerate } from '../services/api';

export default function OKRTreePage() {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [ai, setAi] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    okrsAPI.getAll().then(r => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.data || []);
      setOkrs(list);
      // Default expand first level by quarter
      const init = {};
      list.forEach(o => { init[`q_${o.quarter || 'no-quarter'}`] = true; });
      setExpanded(init);
    }).finally(() => setLoading(false));
  }, []);

  // Group: Quarter → Owner → Objective with Key Results
  const grouped = {};
  okrs.forEach(o => {
    const q = o.quarter || 'No Quarter';
    const owner = o.owner || 'Unassigned';
    if (!grouped[q]) grouped[q] = {};
    if (!grouped[q][owner]) grouped[q][owner] = [];
    grouped[q][owner].push(o);
  });

  const toggle = (k) => setExpanded(e => ({ ...e, [k]: !e[k] }));

  const handleAlignmentCheck = async () => {
    setAiLoading(true);
    try {
      const summary = okrs.map(o => `[${o.quarter}] ${o.owner}: ${o.objective} → ${o.key_result} (${o.progress}%)`).join('\n');
      const res = await aiGenerate({ prompt: `Analyze OKR alignment across teams. Find conflicts, gaps, redundancies. Recommend dependencies and call out at-risk objectives:\n${summary}` });
      setAi(res.data.content || '');
    } catch (e) {
      setAi('AI failed: ' + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiFlag /> OKR Tree</h1>
          <p style={styles.sub}>Hierarchical objectives → key results, grouped by quarter and owner</p>
        </div>
        <button onClick={handleAlignmentCheck} disabled={aiLoading} style={styles.aiBtn}><FiCpu /> {aiLoading ? 'Analyzing...' : 'AI Alignment Check'}</button>
      </div>

      {ai && <div style={styles.aiPanel}><h3 style={{ color: '#a78bfa', marginTop: 0 }}>Alignment Analysis</h3><pre style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, margin: 0, fontFamily: 'inherit' }}>{ai}</pre></div>}

      {loading ? <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading...</div> : (
        <div style={styles.tree}>
          {Object.keys(grouped).sort().map(q => {
            const qKey = `q_${q}`;
            const qOpen = expanded[qKey];
            const qOkrs = Object.values(grouped[q]).flat();
            const avgProg = qOkrs.length ? Math.round(qOkrs.reduce((a, o) => a + (parseInt(o.progress) || 0), 0) / qOkrs.length) : 0;
            return (
              <div key={q} style={styles.qNode}>
                <div onClick={() => toggle(qKey)} style={styles.qHead}>
                  {qOpen ? <FiChevronDown /> : <FiChevronRight />}
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{q}</span>
                  <span style={styles.miniStat}>{qOkrs.length} OKRs · {avgProg}% avg</span>
                </div>
                {qOpen && (
                  <div style={{ paddingLeft: 24 }}>
                    {Object.keys(grouped[q]).map(owner => {
                      const ownerKey = `${qKey}_${owner}`;
                      const oOpen = expanded[ownerKey];
                      const ownerOkrs = grouped[q][owner];
                      return (
                        <div key={owner} style={styles.ownerNode}>
                          <div onClick={() => toggle(ownerKey)} style={styles.ownerHead}>
                            {oOpen ? <FiChevronDown /> : <FiChevronRight />}
                            <span style={{ color: '#3b82f6', fontWeight: 600 }}>{owner}</span>
                            <span style={styles.miniStat}>{ownerOkrs.length} objectives</span>
                          </div>
                          {oOpen && ownerOkrs.map(o => (
                            <div key={o.id} style={styles.objNode}>
                              <div style={styles.objHead}>
                                <div>
                                  <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>O: {o.objective}</div>
                                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>KR: {o.key_result}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                  <span style={{ ...styles.statusPill, color: pillColor(o.status), background: pillColor(o.status) + '20', border: `1px solid ${pillColor(o.status)}40` }}>{o.status || '-'}</span>
                                  <ProgressBar value={o.progress} />
                                </div>
                              </div>
                              {o.target_value && (
                                <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
                                  Target: {o.target_value} · Current: {o.current_value || '-'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function pillColor(s) {
  if (!s) return '#64748b';
  const m = s.toLowerCase();
  if (m.includes('completed')) return '#10b981';
  if (m.includes('active')) return '#3b82f6';
  if (m.includes('risk')) return '#ef4444';
  if (m.includes('cancel')) return '#64748b';
  return '#f59e0b';
}

function ProgressBar({ value }) {
  const v = parseInt(value) || 0;
  const c = v >= 80 ? '#10b981' : v >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${v}%`, height: '100%', background: c }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 32 }}>{v}%</span>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { color: '#f1f5f9', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  aiBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' },
  aiPanel: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16, marginBottom: 16 },
  tree: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 },
  qNode: { marginBottom: 8 },
  qHead: { display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: '#0f172a', borderRadius: 8, cursor: 'pointer' },
  ownerNode: { marginTop: 6 },
  ownerHead: { display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'rgba(59,130,246,0.05)', borderRadius: 6, cursor: 'pointer' },
  objNode: { padding: 12, marginTop: 6, marginLeft: 24, background: '#0f172a', border: '1px solid #334155', borderRadius: 8 },
  objHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  statusPill: { padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  miniStat: { marginLeft: 'auto', color: '#64748b', fontSize: 12 },
};
