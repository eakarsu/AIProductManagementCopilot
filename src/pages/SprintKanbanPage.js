import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCpu } from 'react-icons/fi';
import { sprintsAPI, storiesAPI, aiGenerate } from '../services/api';

const COLUMNS = [
  { key: 'Backlog', color: '#64748b' },
  { key: 'Ready', color: '#f59e0b' },
  { key: 'In Progress', color: '#3b82f6' },
  { key: 'In Review', color: '#a855f7' },
  { key: 'Done', color: '#10b981' },
];

export default function SprintKanbanPage() {
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprintId, setSprintId] = useState('');
  const [loading, setLoading] = useState(true);
  const [retro, setRetro] = useState('');
  const [retroLoading, setRetroLoading] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    Promise.all([sprintsAPI.getAll(), storiesAPI.getAll()]).then(([s, st]) => {
      const sl = Array.isArray(s.data) ? s.data : (s.data?.data || []);
      const stl = Array.isArray(st.data) ? st.data : (st.data?.data || []);
      setSprints(sl);
      setStories(stl);
      if (sl.length && !sprintId) setSprintId(String(sl[0].id));
    }).finally(() => setLoading(false));
  }, []);

  const sprintStories = stories.filter(s => !sprintId || String(s.sprint_id) === String(sprintId));

  const handleDragStart = (id) => setDraggingId(id);

  const handleDrop = async (col) => {
    if (!draggingId) return;
    const story = stories.find(s => s.id === draggingId);
    if (!story || story.status === col) { setDraggingId(null); return; }
    const next = stories.map(s => s.id === draggingId ? { ...s, status: col } : s);
    setStories(next);
    setDraggingId(null);
    try {
      await storiesAPI.update(draggingId, { ...story, status: col });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetro = async () => {
    setRetroLoading(true);
    try {
      const done = sprintStories.filter(s => s.status === 'Done');
      const inProg = sprintStories.filter(s => s.status === 'In Progress');
      const res = await aiGenerate({
        prompt: `Draft a sprint retrospective from these stories. Done: ${JSON.stringify(done.map(s => s.title))}. Still In Progress: ${JSON.stringify(inProg.map(s => s.title))}. Use Start/Stop/Continue format.`,
      });
      setRetro(res.data.content || '');
    } catch (e) {
      setRetro('AI failed: ' + e.message);
    } finally {
      setRetroLoading(false);
    }
  };

  const sprint = sprints.find(s => String(s.id) === sprintId);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiCalendar /> Sprint Kanban</h1>
          <p style={styles.sub}>Drag stories across columns; AI drafts retros from current state</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={sprintId} onChange={e => setSprintId(e.target.value)} style={styles.select}>
            <option value="">All sprints</option>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
          </select>
          <button onClick={handleRetro} disabled={retroLoading} style={styles.aiBtn}><FiCpu /> {retroLoading ? 'Drafting...' : 'AI Draft Retro'}</button>
        </div>
      </div>

      {sprint && (
        <div style={styles.summary}>
          <div><span style={styles.lbl}>Goal:</span> <span style={styles.val}>{sprint.goal || '-'}</span></div>
          <div><span style={styles.lbl}>Capacity:</span> <span style={styles.val}>{sprint.capacity || '?'} pts</span></div>
          <div><span style={styles.lbl}>Stories:</span> <span style={styles.val}>{sprintStories.length}</span></div>
          <div><span style={styles.lbl}>Done:</span> <span style={{ ...styles.val, color: '#10b981' }}>{sprintStories.filter(s => s.status === 'Done').length}</span></div>
        </div>
      )}

      {retro && (
        <div style={styles.retroBox}>
          <h3 style={{ color: '#a78bfa', marginTop: 0 }}>Retro Draft</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{retro}</pre>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Loading...</div> : (
        <div style={styles.board}>
          {COLUMNS.map(col => {
            const colStories = sprintStories.filter(s => s.status === col.key);
            const points = colStories.reduce((a, s) => a + (parseInt(s.story_points) || 0), 0);
            return (
              <div key={col.key} style={styles.col} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col.key)}>
                <div style={{ ...styles.colHead, borderTop: `3px solid ${col.color}` }}>
                  <span style={{ color: col.color }}>{col.key}</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{colStories.length} · {points} pts</span>
                </div>
                <div style={styles.colBody}>
                  {colStories.map(s => (
                    <div key={s.id} draggable onDragStart={() => handleDragStart(s.id)} style={styles.card}>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{s.description?.slice(0, 80) || ''}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                        {s.priority && <span style={{ color: s.priority === 'Critical' ? '#ef4444' : s.priority === 'High' ? '#f59e0b' : '#94a3b8' }}>{s.priority}</span>}
                        {s.story_points && <span style={{ color: '#3b82f6', fontWeight: 600 }}>{s.story_points} pts</span>}
                      </div>
                    </div>
                  ))}
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
  select: { padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit' },
  aiBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit' },
  summary: { display: 'flex', gap: 24, padding: 16, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, marginBottom: 16, flexWrap: 'wrap' },
  lbl: { color: '#64748b', fontSize: 12 },
  val: { color: '#f1f5f9', fontSize: 13, fontWeight: 600 },
  retroBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16, marginBottom: 16 },
  board: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, minHeight: 500 },
  col: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, display: 'flex', flexDirection: 'column' },
  colHead: { padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 13 },
  colBody: { padding: 10, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto' },
  card: { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, cursor: 'grab' },
};
