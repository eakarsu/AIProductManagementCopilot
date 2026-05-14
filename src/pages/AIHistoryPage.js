import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { aiHistory } from '../services/api';

const ENDPOINT_LABELS = {
  'generate': 'AI Generate',
  'prioritize': 'Feature Prioritization',
  'generate-stories': 'Story Generation',
  'market-research': 'Market Research',
  'competitive-analysis': 'Competitive Analysis',
  'analyze-feedback': 'Feedback Analysis',
  'generate-prd': 'PRD Generation',
  'assess-risk': 'Risk Assessment',
};

export default function AIHistoryPage() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await aiHistory(page, 20);
      setHistory(res.data.history);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load AI history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  const endpointColor = (endpoint) => {
    const colors = {
      'prioritize': '#8b5cf6',
      'generate-stories': '#10b981',
      'assess-risk': '#ef4444',
      'generate-prd': '#3b82f6',
      'market-research': '#06b6d4',
      'competitive-analysis': '#f97316',
      'analyze-feedback': '#a855f7',
    };
    return colors[endpoint] || '#94a3b8';
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiClock style={{ marginRight: '10px' }} />AI History</h1>
          <p style={styles.subtitle}>{pagination.total} total analyses</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading AI history...</div>
      ) : history.length === 0 ? (
        <div style={styles.empty}>No AI analyses yet. Use any AI feature to see history here.</div>
      ) : (
        <>
          <div style={styles.list}>
            {history.map(item => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div style={styles.cardLeft}>
                    <span style={{ ...styles.badge, background: `${endpointColor(item.endpoint)}20`, color: endpointColor(item.endpoint), border: `1px solid ${endpointColor(item.endpoint)}40` }}>
                      {ENDPOINT_LABELS[item.endpoint] || item.endpoint}
                    </span>
                    {item.entity_type && (
                      <span style={styles.entityBadge}>
                        {item.entity_type} #{item.entity_id}
                      </span>
                    )}
                  </div>
                  <span style={styles.date}>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                {item.result_preview && (
                  <p style={styles.preview}>{item.result_preview}...</p>
                )}
                {expandedId === item.id && item.result_json && (
                  <div style={styles.jsonBox}>
                    <pre style={styles.jsonPre}>{JSON.stringify(item.result_json, null, 2)}</pre>
                  </div>
                )}
                {item.result_json && (
                  <button
                    style={styles.expandBtn}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {expandedId === item.id ? 'Collapse JSON' : 'View JSON'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={styles.paginationRow}>
              <button
                style={{ ...styles.pageBtn, opacity: pagination.page <= 1 ? 0.4 : 1 }}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <FiChevronLeft size={16} /> Prev
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                style={{ ...styles.pageBtn, opacity: pagination.page >= pagination.totalPages ? 0.4 : 1 }}
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '13px',
    marginTop: '4px',
  },
  loading: { textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '15px' },
  empty: {
    textAlign: 'center', color: '#64748b', padding: '60px 0', fontSize: '15px',
    background: '#1e293b', borderRadius: '12px', border: '1px solid #334155',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: '#1e293b',
    borderRadius: '10px',
    border: '1px solid #334155',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  entityBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#0f172a',
    color: '#64748b',
    border: '1px solid #334155',
  },
  date: { fontSize: '12px', color: '#475569' },
  preview: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.5',
    marginBottom: '8px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  expandBtn: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#64748b',
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  jsonBox: {
    background: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155',
    padding: '12px',
    marginBottom: '8px',
    maxHeight: '300px',
    overflow: 'auto',
  },
  jsonPre: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  pageInfo: { color: '#64748b', fontSize: '13px' },
};
