import React, { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiCpu, FiAlertTriangle, FiStar, FiTool, FiAlertCircle, FiCopy, FiCheck } from 'react-icons/fi';
import { releasesAPI, releaseAIGenerateNotes } from '../services/api';

export default function ReleaseNotesPage() {
  const [releases, setReleases] = useState([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await releasesAPI.getAll();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setReleases(list);
      if (list.length > 0) setSelectedReleaseId(String(list[0].id));
    } catch (err) {
      setError('Failed to load releases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const handleGenerate = async () => {
    if (!selectedReleaseId) return;
    setGenerating(true);
    setError('');
    setNotes(null);
    try {
      const res = await releaseAIGenerateNotes(selectedReleaseId);
      setNotes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate notes');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const parsed = notes?.parsed;
    if (!parsed) return;
    const text = [
      `# ${parsed.version || ''} Release Notes`,
      `**${parsed.headline || ''}**`,
      '',
      parsed.summary || '',
      '',
      parsed.new_features?.length > 0 ? `## New Features\n${parsed.new_features.map(f => `- **${f.title}**: ${f.description}`).join('\n')}` : '',
      parsed.improvements?.length > 0 ? `## Improvements\n${parsed.improvements.map(i => `- **${i.title}**: ${i.description}`).join('\n')}` : '',
      parsed.bug_fixes?.length > 0 ? `## Bug Fixes\n${parsed.bug_fixes.map(b => `- ${b.title}: ${b.description}`).join('\n')}` : '',
      parsed.breaking_changes?.length > 0 ? `## Breaking Changes\n${parsed.breaking_changes.map(c => `- ${c}`).join('\n')}` : '',
      parsed.migration_notes ? `## Migration Notes\n${parsed.migration_notes}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const parsed = notes?.parsed;
  const selectedRelease = releases.find(r => String(r.id) === selectedReleaseId);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiPackage style={{ marginRight: '10px' }} />Release Notes Generator</h1>
          <p style={styles.subtitle}>AI-generated structured release notes from completed stories and fixes</p>
        </div>
      </div>

      <div style={styles.selectorCard}>
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Select Release</label>
            {loading ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>Loading releases...</div>
            ) : (
              <select
                value={selectedReleaseId}
                onChange={(e) => { setSelectedReleaseId(e.target.value); setNotes(null); }}
                style={styles.select}
              >
                <option value="">Choose a release...</option>
                {releases.map(r => (
                  <option key={r.id} value={r.id}>{r.version} — {r.name} ({r.status})</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleGenerate}
            style={styles.generateBtn}
            disabled={!selectedReleaseId || generating}
          >
            <FiCpu size={16} /> {generating ? 'Generating...' : 'Generate Notes'}
          </button>
        </div>

        {selectedRelease && (
          <div style={styles.releaseSummary}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Version: <span style={{ color: '#f1f5f9' }}>{selectedRelease.version}</span></span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Status: <span style={{ color: '#3b82f6' }}>{selectedRelease.status}</span></span>
            {selectedRelease.release_date && <span style={{ color: '#64748b', fontSize: '12px' }}>Date: <span style={{ color: '#f1f5f9' }}>{new Date(selectedRelease.release_date).toLocaleDateString()}</span></span>}
            {selectedRelease.features_count > 0 && <span style={{ color: '#64748b', fontSize: '12px' }}>Features: <span style={{ color: '#10b981' }}>{selectedRelease.features_count}</span></span>}
            {selectedRelease.bug_fixes_count > 0 && <span style={{ color: '#64748b', fontSize: '12px' }}>Bug Fixes: <span style={{ color: '#ef4444' }}>{selectedRelease.bug_fixes_count}</span></span>}
          </div>
        )}
      </div>

      {error && <div style={styles.errorBox}><FiAlertTriangle size={16} /> {error}</div>}

      {generating && (
        <div style={styles.loadingMsg}>
          <FiCpu size={24} style={{ marginBottom: '12px' }} />
          <div>Analyzing completed stories and generating release notes...</div>
        </div>
      )}

      {parsed && (
        <div style={styles.notesContainer}>
          {/* Header */}
          <div style={styles.notesHeader}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                {parsed.version} — {parsed.headline}
              </h2>
              {parsed.release_date && <span style={{ color: '#64748b', fontSize: '13px' }}>{parsed.release_date}</span>}
              {parsed.summary && <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>{parsed.summary}</p>}
            </div>
            <button onClick={handleCopy} style={styles.copyBtn}>
              {copied ? <><FiCheck size={14} /> Copied!</> : <><FiCopy size={14} /> Copy Markdown</>}
            </button>
          </div>

          {/* New Features */}
          {parsed.new_features?.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#10b981' }}><FiStar size={16} /> New Features ({parsed.new_features.length})</h3>
              {parsed.new_features.map((f, i) => (
                <div key={i} style={{ ...styles.noteItem, borderLeft: '3px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{f.title}</span>
                    {f.impact && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: f.impact === 'High' ? '#10b98120' : '#f59e0b20', color: f.impact === 'High' ? '#10b981' : '#f59e0b' }}>
                        {f.impact} Impact
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', lineHeight: '1.5' }}>{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {parsed.improvements?.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#3b82f6' }}><FiTool size={16} /> Improvements ({parsed.improvements.length})</h3>
              {parsed.improvements.map((imp, i) => (
                <div key={i} style={{ ...styles.noteItem, borderLeft: '3px solid #3b82f6' }}>
                  <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{imp.title}</span>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', lineHeight: '1.5' }}>{imp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bug Fixes */}
          {parsed.bug_fixes?.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}><FiAlertCircle size={16} /> Bug Fixes ({parsed.bug_fixes.length})</h3>
              {parsed.bug_fixes.map((bug, i) => (
                <div key={i} style={{ ...styles.noteItem, borderLeft: '3px solid #ef4444' }}>
                  <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{bug.title}</span>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', lineHeight: '1.5' }}>{bug.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Breaking Changes */}
          {parsed.breaking_changes?.length > 0 && (
            <div style={{ ...styles.section, background: '#ef444410', border: '1px solid #ef444430', borderRadius: '10px', padding: '16px' }}>
              <h3 style={{ ...styles.sectionTitle, color: '#ef4444' }}><FiAlertTriangle size={16} /> Breaking Changes</h3>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                {parsed.breaking_changes.map((c, i) => (
                  <li key={i} style={{ color: '#fca5a5', fontSize: '13px', marginBottom: '6px' }}>{c}</li>
                ))}
              </ul>
              {parsed.migration_notes && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b', marginBottom: '6px', textTransform: 'uppercase' }}>Migration Notes</div>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>{parsed.migration_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Acknowledgements */}
          {parsed.acknowledgements && (
            <div style={{ ...styles.section, padding: '14px', background: '#0f172a', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Acknowledgements</div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{parsed.acknowledgements}</p>
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
  row: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  label: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' },
  select: { padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit', minWidth: '280px' },
  generateBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  releaseSummary: { display: 'flex', gap: '20px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #334155', flexWrap: 'wrap' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', border: '1px solid #ef444430', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  loadingMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#64748b', fontSize: '15px' },
  notesContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  notesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', flexWrap: 'wrap', gap: '16px' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '8px' },
  noteItem: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' },
};
