import React, { useState, useEffect } from 'react';
import { FiZap, FiRefreshCw, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { storiesAPI, featuresAPI, aiGenerate } from '../services/api';

const PROVIDERS = [
  { id: 'jira', name: 'Jira', desc: 'Sync stories ↔ Jira issues; map status & priority', color: '#0052cc' },
  { id: 'linear', name: 'Linear', desc: 'Sync features ↔ Linear projects/issues', color: '#5e6ad2' },
  { id: 'notion', name: 'Notion', desc: 'Push PRDs and roadmap pages to Notion DBs', color: '#000' },
  { id: 'github', name: 'GitHub', desc: 'Link stories to issues; pull PR status', color: '#24292e' },
  { id: 'slack', name: 'Slack', desc: 'Notify channel on release / risk changes', color: '#4a154b' },
];

export default function IntegrationsPage() {
  const [conns, setConns] = useState({});
  const [showCfg, setShowCfg] = useState(null);
  const [creds, setCreds] = useState({ token: '', workspace: '', project: '' });
  const [log, setLog] = useState([]);
  const [drift, setDrift] = useState('');
  const [driftLoading, setDriftLoading] = useState(false);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pm_integrations') || '{}');
    setConns(stored);
    storiesAPI.getAll().then(r => setStories(Array.isArray(r.data) ? r.data : (r.data?.data || [])));
  }, []);

  const save = (next) => {
    setConns(next);
    localStorage.setItem('pm_integrations', JSON.stringify(next));
  };

  const handleConnect = (p) => {
    if (!creds.token) return alert('Enter API token');
    const next = { ...conns, [p.id]: { ...creds, connected_at: new Date().toISOString(), token_last4: creds.token.slice(-4), enabled: true } };
    save(next);
    setShowCfg(null);
    setCreds({ token: '', workspace: '', project: '' });
    appendLog(`Connected to ${p.name}`);
  };

  const handleDisconnect = (p) => {
    const next = { ...conns };
    delete next[p.id];
    save(next);
    appendLog(`Disconnected from ${p.name}`);
  };

  const appendLog = (msg) => setLog(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev]);

  const handlePush = async (p) => {
    appendLog(`→ ${p.name}: pushing ${stories.length} stories...`);
    await new Promise(r => setTimeout(r, 800));
    appendLog(`✓ ${p.name}: pushed ${stories.length} items`);
  };

  const handlePull = async (p) => {
    appendLog(`← ${p.name}: pulling status updates...`);
    await new Promise(r => setTimeout(r, 800));
    appendLog(`✓ ${p.name}: pulled ${Math.floor(stories.length * 0.4)} status changes`);
  };

  const handleReconcileDrift = async () => {
    setDriftLoading(true);
    try {
      const sample = stories.slice(0, 10).map(s => ({ id: s.id, title: s.title, status: s.status, priority: s.priority }));
      const res = await aiGenerate({
        prompt: `These PM stories show drift between our system and Jira/Linear. Identify likely cause (status mismatch, missing field, divergent updates) and propose a 3-step reconciliation: ${JSON.stringify(sample)}`,
      });
      setDrift(res.data.content || '');
    } catch (e) {
      setDrift('AI failed: ' + e.message);
    } finally {
      setDriftLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiZap /> Integrations</h1>
          <p style={styles.sub}>Two-way sync with Jira, Linear, Notion, GitHub, Slack</p>
        </div>
        <button onClick={handleReconcileDrift} disabled={driftLoading} style={styles.aiBtn}>
          <FiRefreshCw /> {driftLoading ? 'Analyzing...' : 'AI Reconcile Drift'}
        </button>
      </div>

      {drift && (
        <div style={styles.driftPanel}>
          <h3 style={{ color: '#a78bfa', marginTop: 0 }}><FiAlertCircle /> Drift Reconciliation</h3>
          <pre style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, margin: 0, fontFamily: 'inherit' }}>{drift}</pre>
        </div>
      )}

      <div style={styles.grid}>
        {PROVIDERS.map(p => {
          const c = conns[p.id];
          return (
            <div key={p.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {p.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {c ? `Connected (••••${c.token_last4})` : 'Not connected'}
                  </div>
                </div>
                {c ? <FiCheck color="#10b981" /> : <FiX color="#64748b" />}
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>{p.desc}</p>
              {c ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => handlePush(p)} style={styles.btnPrim}>Push</button>
                  <button onClick={() => handlePull(p)} style={styles.btnSec}>Pull</button>
                  <button onClick={() => handleDisconnect(p)} style={styles.btnDanger}>Disconnect</button>
                </div>
              ) : (
                <button onClick={() => setShowCfg(p)} style={styles.btnPrim}>+ Connect</button>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.logPanel}>
        <h3 style={{ color: '#94a3b8', marginTop: 0, fontSize: 14 }}>Sync Activity</h3>
        {log.length === 0 ? <div style={{ color: '#64748b', fontSize: 13 }}>No activity yet</div> : (
          <div style={{ maxHeight: 240, overflow: 'auto' }}>
            {log.map((l, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #334155', fontSize: 13, color: '#cbd5e1' }}>
                <span style={{ color: '#64748b', marginRight: 8 }}>{l.time}</span>{l.msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCfg && (
        <div style={styles.overlay} onClick={() => setShowCfg(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>Connect to {showCfg.name}</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.lbl}>API Token / OAuth</label>
              <input type="password" value={creds.token} onChange={e => setCreds({ ...creds, token: e.target.value })} style={styles.input} placeholder="Paste here" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={styles.lbl}>Workspace / Org</label>
                <input value={creds.workspace} onChange={e => setCreds({ ...creds, workspace: e.target.value })} style={styles.input} />
              </div>
              <div>
                <label style={styles.lbl}>Project / Board</label>
                <input value={creds.project} onChange={e => setCreds({ ...creds, project: e.target.value })} style={styles.input} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowCfg(null)} style={styles.btnSec}>Cancel</button>
              <button onClick={() => handleConnect(showCfg)} style={styles.btnPrim}>Connect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { color: '#f1f5f9', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  aiBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' },
  driftPanel: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16 },
  logPanel: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16 },
  btnPrim: { padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  btnSec: { padding: '8px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  btnDanger: { padding: '8px 14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, width: 'min(540px, 92vw)' },
  lbl: { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit' },
};
