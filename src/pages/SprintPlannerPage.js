import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiCpu, FiCheckCircle, FiXCircle, FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { sprintsAPI, sprintAIPlan, sprintVelocity } from '../services/api';

export default function SprintPlannerPage() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [velocityData, setVelocityData] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetchSprints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sprintsAPI.getAll();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSprints(list);
      if (list.length > 0 && !selectedSprintId) {
        setSelectedSprintId(String(list[0].id));
      }
    } catch (err) {
      setError('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  }, [selectedSprintId]);

  useEffect(() => { fetchSprints(); }, [fetchSprints]);

  const handleSprintChange = async (id) => {
    setSelectedSprintId(id);
    setPlan(null);
    setVelocityData(null);
    if (id) {
      try {
        const res = await sprintVelocity(id);
        setVelocityData(res.data);
      } catch { /* ignore */ }
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedSprintId) return;
    setPlanning(true);
    setError('');
    setPlan(null);
    try {
      const res = await sprintAIPlan(selectedSprintId);
      setPlan(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Planning failed');
    } finally {
      setPlanning(false);
    }
  };

  const parsed = plan?.parsed;
  const sprint = plan?.sprint;
  const selectedSprint = sprints.find(s => String(s.id) === selectedSprintId);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiCalendar style={{ marginRight: '10px' }} />Sprint Planning Assistant</h1>
          <p style={styles.subtitle}>AI recommends which backlog items to include based on capacity and priority</p>
        </div>
      </div>

      {/* Sprint Selector */}
      <div style={styles.selectorCard}>
        <div style={styles.selectorRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Select Sprint</label>
            {loading ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>Loading sprints...</div>
            ) : (
              <select
                value={selectedSprintId}
                onChange={(e) => handleSprintChange(e.target.value)}
                style={styles.select}
              >
                <option value="">Choose a sprint...</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status}) — {s.capacity || '?'} pts capacity</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleGeneratePlan}
            style={styles.planBtn}
            disabled={!selectedSprintId || planning}
          >
            <FiCpu size={16} /> {planning ? 'Generating Plan...' : 'AI Generate Plan'}
          </button>
        </div>

        {/* Sprint Summary */}
        {selectedSprint && (
          <div style={styles.sprintSummary}>
            <div style={styles.sprintStat}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Goal</span>
              <span style={{ color: '#f1f5f9', fontSize: '13px' }}>{selectedSprint.goal || 'Not set'}</span>
            </div>
            <div style={styles.sprintStat}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Capacity</span>
              <span style={{ color: '#f59e0b', fontSize: '15px', fontWeight: '700' }}>{selectedSprint.capacity || '?'} pts</span>
            </div>
            <div style={styles.sprintStat}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Status</span>
              <span style={{ color: '#3b82f6', fontSize: '13px' }}>{selectedSprint.status}</span>
            </div>
            {velocityData && (
              <>
                <div style={styles.sprintStat}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Completed Pts</span>
                  <span style={{ color: '#10b981', fontSize: '15px', fontWeight: '700' }}>{velocityData.completed_points}</span>
                </div>
                <div style={styles.sprintStat}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Completion</span>
                  <span style={{ color: velocityData.completion_rate >= 80 ? '#10b981' : '#f59e0b', fontSize: '15px', fontWeight: '700' }}>{velocityData.completion_rate}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && <div style={styles.errorBox}><FiAlertTriangle size={16} /> {error}</div>}

      {planning && (
        <div style={styles.loadingMsg}>
          <FiCpu size={24} style={{ marginBottom: '12px' }} />
          <div>Analyzing backlog and generating sprint plan...</div>
        </div>
      )}

      {parsed && (
        <div style={styles.results}>
          {/* Sprint Summary from AI */}
          {parsed.sprint_summary && (
            <div style={styles.summaryPanel}>
              <h3 style={styles.panelTitle}>Sprint Plan Summary</h3>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{parsed.sprint_summary.total_recommended_points}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Recommended Points</div>
                </div>
                <div style={styles.summaryItem}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{parsed.sprint_summary.capacity_utilization}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Capacity Utilization</div>
                </div>
                <div style={styles.summaryItem}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: parsed.sprint_summary.risk_level === 'High' ? '#ef4444' : parsed.sprint_summary.risk_level === 'Medium' ? '#f59e0b' : '#10b981' }}>
                    {parsed.sprint_summary.risk_level}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Risk Level</div>
                </div>
                <div style={styles.summaryItem}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{parsed.recommended_stories?.length || 0}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Stories Recommended</div>
                </div>
              </div>
              {parsed.sprint_summary.focus_areas?.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Focus Areas</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {parsed.sprint_summary.focus_areas.map((f, i) => (
                      <span key={i} style={{ padding: '3px 10px', background: '#3b82f620', color: '#3b82f6', borderRadius: '20px', fontSize: '12px' }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations + Warnings */}
          {(parsed.recommendations?.length > 0 || parsed.warnings?.length > 0) && (
            <div style={styles.twoCol}>
              {parsed.recommendations?.length > 0 && (
                <div style={styles.panel}>
                  <h3 style={{ ...styles.panelTitle, color: '#10b981' }}><FiCheckCircle size={16} /> Recommendations</h3>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {parsed.recommendations.map((r, i) => (
                      <li key={i} style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', lineHeight: '1.5' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.warnings?.length > 0 && (
                <div style={styles.panel}>
                  <h3 style={{ ...styles.panelTitle, color: '#f59e0b' }}><FiAlertTriangle size={16} /> Warnings</h3>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {parsed.warnings.map((w, i) => (
                      <li key={i} style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px', lineHeight: '1.5' }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Recommended Stories */}
          {parsed.recommended_stories?.length > 0 && (
            <div style={styles.panel}>
              <h3 style={{ ...styles.panelTitle, color: '#10b981' }}><FiCheckCircle size={16} /> Recommended Stories ({parsed.recommended_stories.length})</h3>
              <div style={styles.storiesList}>
                {parsed.recommended_stories.map((story, i) => (
                  <div key={i} style={styles.storyCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{story.title}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {story.priority && (
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', background: story.priority === 'Critical' ? '#ef444420' : story.priority === 'High' ? '#f97316 20' : '#f59e0b20', color: story.priority === 'Critical' ? '#ef4444' : story.priority === 'High' ? '#f97316' : '#f59e0b' }}>
                            {story.priority}
                          </span>
                        )}
                        {story.story_points && (
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', background: '#3b82f620', color: '#3b82f6' }}>
                            {story.story_points} pts
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{story.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Excluded Stories */}
          {parsed.excluded_stories?.length > 0 && (
            <div style={styles.panel}>
              <div
                style={{ ...styles.panelTitle, color: '#64748b', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setExpanded(e => ({ ...e, excluded: !e.excluded }))}
              >
                <FiXCircle size={16} />
                Excluded Stories ({parsed.excluded_stories.length})
                {expanded.excluded ? <FiChevronUp size={14} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={14} style={{ marginLeft: 'auto' }} />}
              </div>
              {expanded.excluded && (
                <div style={styles.storiesList}>
                  {parsed.excluded_stories.map((story, i) => (
                    <div key={i} style={{ ...styles.storyCard, opacity: 0.6 }}>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{story.title}</span>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{story.reason}</p>
                    </div>
                  ))}
                </div>
              )}
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
  selectorCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  selectorRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' },
  select: { padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit', minWidth: '280px' },
  planBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  sprintSummary: { display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155', flexWrap: 'wrap' },
  sprintStat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  loadingMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#64748b', fontSize: '15px' },
  results: { display: 'flex', flexDirection: 'column', gap: '16px' },
  summaryPanel: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' },
  summaryItem: { background: '#0f172a', borderRadius: '8px', padding: '14px', border: '1px solid #334155', textAlign: 'center' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  panel: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '14px' },
  storiesList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  storyCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' },
};
