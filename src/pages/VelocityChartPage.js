import React, { useState, useEffect, useCallback } from 'react';
import { FiBarChart2, FiRefreshCw, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import * as api from '../services/api';

function SimpleBarChart({ data, width = 600, height = 200 }) {
  if (!data || data.length === 0) return <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No data to chart</div>;
  const maxVal = Math.max(...data.map(d => Math.max(d.planned || 0, d.completed || 0)), 1);
  const barWidth = Math.floor((width - 60) / data.length / 2 - 4);
  return (
    <svg viewBox={`0 0 ${width} ${height + 60}`} style={{ width: '100%', fontFamily: 'inherit' }}>
      {/* Y grid lines */}
      {[0, 25, 50, 75, 100].map(pct => {
        const y = height - (pct / 100) * height;
        const val = Math.round((pct / 100) * maxVal);
        return (
          <g key={pct}>
            <line x1={50} y1={y} x2={width} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={44} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">{val}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const groupW = (width - 60) / data.length;
        const groupX = 50 + i * groupW + groupW * 0.1;
        const plannedH = maxVal > 0 ? ((d.planned || 0) / maxVal) * height : 0;
        const completedH = maxVal > 0 ? ((d.completed || 0) / maxVal) * height : 0;
        return (
          <g key={i}>
            {/* Planned bar */}
            <rect x={groupX} y={height - plannedH} width={barWidth} height={plannedH} fill="#3b82f660" rx={2} />
            {/* Completed bar */}
            <rect x={groupX + barWidth + 2} y={height - completedH} width={barWidth} height={completedH} fill="#10b98190" rx={2} />
            {/* Label */}
            <text x={groupX + barWidth} y={height + 20} textAnchor="middle" fontSize={9} fill="#94a3b8">{d.label?.slice(0, 8)}</text>
            {/* Values */}
            {plannedH > 10 && <text x={groupX + barWidth / 2} y={height - plannedH - 3} textAnchor="middle" fontSize={9} fill="#3b82f6">{d.planned}</text>}
            {completedH > 10 && <text x={groupX + barWidth * 1.5 + 2} y={height - completedH - 3} textAnchor="middle" fontSize={9} fill="#10b981">{d.completed}</text>}
          </g>
        );
      })}
      {/* Legend */}
      <rect x={width - 150} y={5} width={12} height={12} fill="#3b82f660" rx={2} />
      <text x={width - 133} y={14} fontSize={11} fill="#94a3b8">Planned</text>
      <rect x={width - 70} y={5} width={12} height={12} fill="#10b98190" rx={2} />
      <text x={width - 53} y={14} fontSize={11} fill="#94a3b8">Completed</text>
    </svg>
  );
}

export default function VelocityChartPage() {
  const [sprints, setSprints] = useState([]);
  const [velocities, setVelocities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState('');

  const fetchSprints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.sprintsAPI.getAll();
      const sprintList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSprints(sprintList);
    } catch (err) {
      setError('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSprints(); }, [fetchSprints]);

  const computeAllVelocities = async () => {
    setComputing(true);
    setError('');
    const results = [];
    for (const sprint of sprints.slice(0, 10)) {
      try {
        const res = await api.sprintVelocity(sprint.id);
        results.push({
          label: sprint.name?.slice(0, 12) || `Sprint ${sprint.id}`,
          planned: res.data.planned_points,
          completed: res.data.completed_points,
          rate: res.data.completion_rate,
          sprint_id: sprint.id,
        });
      } catch {
        results.push({ label: sprint.name?.slice(0, 12) || `Sprint ${sprint.id}`, planned: sprint.capacity || 0, completed: sprint.velocity || 0, rate: 0, sprint_id: sprint.id });
      }
    }
    setVelocities(results);
    setComputing(false);
  };

  const avgVelocity = velocities.length > 0
    ? Math.round(velocities.reduce((s, v) => s + v.completed, 0) / velocities.length)
    : 0;
  const avgCompletion = velocities.length > 0
    ? Math.round(velocities.reduce((s, v) => s + v.rate, 0) / velocities.length)
    : 0;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiBarChart2 style={{ marginRight: '10px' }} />Velocity Chart</h1>
          <p style={styles.subtitle}>Sprint velocity trends and completion rates</p>
        </div>
        <button onClick={computeAllVelocities} style={styles.computeBtn} disabled={computing || loading}>
          <FiRefreshCw size={16} /> {computing ? 'Computing...' : 'Compute Velocity'}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loadingMsg}>Loading sprint data...</div>
      ) : (
        <>
          {/* Summary stats */}
          {velocities.length > 0 && (
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{avgVelocity}</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Avg Points/Sprint</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{avgCompletion}%</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Avg Completion Rate</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{velocities.length}</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Sprints Analyzed</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiTrendingUp color="#10b981" size={20} />
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                    {velocities.length > 1 && velocities[velocities.length - 1]?.completed > velocities[0]?.completed ? '+' : ''}
                    {velocities.length > 1 ? velocities[velocities.length - 1]?.completed - velocities[0]?.completed : 0}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>First vs Last Sprint</div>
              </div>
            </div>
          )}

          {/* Chart */}
          {velocities.length > 0 ? (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Sprint Velocity (Planned vs Completed Points)</h3>
              <SimpleBarChart data={velocities} />
            </div>
          ) : (
            <div style={styles.emptyBox}>
              <FiCalendar size={32} style={{ marginBottom: '12px', color: '#334155' }} />
              <div style={{ color: '#64748b', marginBottom: '12px' }}>
                {sprints.length === 0 ? 'No sprints found. Create sprints to see velocity data.' : `${sprints.length} sprints found. Click "Compute Velocity" to analyze.`}
              </div>
              {sprints.length > 0 && (
                <button onClick={computeAllVelocities} style={styles.computeBtn}>
                  <FiRefreshCw size={16} /> Compute Velocity
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {velocities.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Sprint', 'Planned Pts', 'Completed Pts', 'Completion Rate', 'Status'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {velocities.map((v, i) => {
                    const rateColor = v.rate >= 80 ? '#10b981' : v.rate >= 50 ? '#f59e0b' : '#ef4444';
                    return (
                      <tr key={i}>
                        <td style={styles.td}>{v.label}</td>
                        <td style={{ ...styles.td, color: '#3b82f6', fontWeight: '600' }}>{v.planned}</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: '600' }}>{v.completed}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '80px', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${v.rate}%`, height: '100%', background: rateColor, borderRadius: '3px' }} />
                            </div>
                            <span style={{ color: rateColor, fontWeight: '600', fontSize: '13px' }}>{v.rate}%</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ padding: '3px 10px', background: rateColor + '20', color: rateColor, borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                            {v.rate >= 80 ? 'On Track' : v.rate >= 50 ? 'At Risk' : 'Behind'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center' },
  subtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px' },
  computeBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' },
  errorBox: { padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  loadingMsg: { textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '15px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' },
  statCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '18px' },
  chartCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
  tableWrap: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)' },
  td: { padding: '12px 16px', borderBottom: '1px solid rgba(51,65,85,0.5)', color: '#cbd5e1', fontSize: '13px' },
};
