import React, { useState, useEffect } from 'react';
import { FiMap, FiCpu } from 'react-icons/fi';
import { roadmapAPI, aiGenerate } from '../services/api';

export default function RoadmapGanttPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [zoom, setZoom] = useState('quarter'); // month | quarter

  useEffect(() => {
    roadmapAPI.getAll().then(r => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.data || []);
      setItems(list);
    }).finally(() => setLoading(false));
  }, []);

  const reAIPrioritize = async () => {
    setAiLoading(true);
    try {
      const res = await aiGenerate({
        prompt: `Re-prioritize this roadmap by impact / urgency / dependencies and suggest schedule shifts: ${JSON.stringify(items.slice(0, 30).map(i => ({ id: i.id, title: i.title, status: i.status, priority: i.priority, quarter: i.quarter, progress: i.progress })))}`,
      });
      setAiText(res.data.content || '');
    } catch (e) {
      setAiText('AI failed: ' + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Date helpers
  const parseDate = (d) => d ? new Date(d) : null;
  const minDate = items.reduce((m, i) => {
    const d = parseDate(i.start_date);
    return d && (!m || d < m) ? d : m;
  }, null) || new Date();
  const maxDate = items.reduce((m, i) => {
    const d = parseDate(i.end_date);
    return d && (!m || d > m) ? d : m;
  }, null) || new Date(Date.now() + 365 * 86400000);

  const totalDays = Math.max(30, Math.ceil((maxDate - minDate) / 86400000));
  const dayWidth = zoom === 'month' ? 4 : 2;

  // Generate month markers
  const months = [];
  let cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cursor <= maxDate) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const statusColor = {
    'Planned': '#f59e0b', 'In Progress': '#3b82f6', 'Completed': '#10b981', 'On Hold': '#64748b',
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiMap /> Roadmap Gantt</h1>
          <p style={styles.sub}>Timeline view of roadmap items with start/end dates and progress</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setZoom(zoom === 'month' ? 'quarter' : 'month')} style={styles.btn}>{zoom === 'month' ? 'Quarter view' : 'Month view'}</button>
          <button onClick={reAIPrioritize} disabled={aiLoading} style={styles.aiBtn}><FiCpu /> {aiLoading ? 'Analyzing...' : 'AI Re-prioritize'}</button>
        </div>
      </div>

      {aiText && <div style={styles.aiPanel}><h3 style={styles.aiHead}>AI Recommendations</h3><div style={styles.aiBody}>{aiText}</div></div>}

      {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div> : (
        <div style={styles.ganttWrap}>
          {/* Header row with months */}
          <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
            <div style={{ ...styles.taskCol, fontWeight: 700, color: '#94a3b8' }}>Item</div>
            <div style={{ position: 'relative', height: 40, flex: 1, overflow: 'hidden' }}>
              {months.map((m, i) => {
                const left = ((m - minDate) / 86400000) * dayWidth;
                return (
                  <div key={i} style={{ position: 'absolute', left, top: 0, bottom: 0, borderLeft: '1px solid #334155', paddingLeft: 4, fontSize: 11, color: '#64748b' }}>
                    {m.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item rows */}
          {items.map(item => {
            const start = parseDate(item.start_date) || minDate;
            const end = parseDate(item.end_date) || new Date(start.getTime() + 30 * 86400000);
            const left = ((start - minDate) / 86400000) * dayWidth;
            const width = Math.max(20, ((end - start) / 86400000) * dayWidth);
            const progress = parseInt(item.progress) || 0;
            const color = statusColor[item.status] || '#3b82f6';
            return (
              <div key={item.id} style={{ display: 'flex', borderBottom: '1px solid rgba(51,65,85,0.4)', minHeight: 44 }}>
                <div style={styles.taskCol}>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{item.owner || '-'} · {item.quarter || '-'}</div>
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{
                    position: 'absolute', left, width, top: 8, height: 28,
                    background: `${color}30`, border: `1px solid ${color}`, borderRadius: 6,
                    display: 'flex', alignItems: 'center', overflow: 'hidden',
                  }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: color, opacity: 0.7 }} />
                    <span style={{ position: 'absolute', left: 8, fontSize: 11, color: '#fff', fontWeight: 600 }}>{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { color: '#f1f5f9', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  btn: { padding: '10px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit' },
  aiBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' },
  ganttWrap: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'auto', maxHeight: 'calc(100vh - 250px)' },
  taskCol: { width: 240, minWidth: 240, padding: '10px 14px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  aiPanel: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16, marginBottom: 16 },
  aiHead: { color: '#a78bfa', fontSize: 14, marginTop: 0 },
  aiBody: { color: '#cbd5e1', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6 },
};
