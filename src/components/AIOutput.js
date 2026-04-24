import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiCpu, FiCopy, FiCheck } from 'react-icons/fi';

export default function AIOutput({ content, loading, error }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.aiIcon, animation: 'pulse 1.5s infinite' }}>
              <FiCpu size={18} />
            </div>
            <span style={styles.headerTitle}>AI is thinking...</span>
          </div>
        </div>
        <div style={styles.loadingBody}>
          <div style={styles.shimmer} />
          <div style={{ ...styles.shimmer, width: '80%' }} />
          <div style={{ ...styles.shimmer, width: '60%' }} />
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, borderColor: 'rgba(239,68,68,0.3)' }}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.aiIcon, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              <FiCpu size={18} />
            </div>
            <span style={{ ...styles.headerTitle, color: '#fca5a5' }}>AI Error</span>
          </div>
        </div>
        <div style={styles.body}>
          <p style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.aiIcon}>
            <FiCpu size={18} />
          </div>
          <span style={styles.headerTitle}>AI Analysis</span>
          <span style={styles.badge}>Claude Haiku</span>
        </div>
        <button onClick={handleCopy} style={styles.copyBtn}>
          {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={styles.body}>
        <div style={styles.markdown}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: '20px 0 10px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#e2e8f0', margin: '18px 0 8px' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#cbd5e1', margin: '14px 0 6px' }}>{children}</h3>,
              p: ({ children }) => <p style={{ margin: '8px 0', lineHeight: '1.7', color: '#cbd5e1', fontSize: '14px' }}>{children}</p>,
              ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#cbd5e1' }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: '20px', color: '#cbd5e1' }}>{children}</ol>,
              li: ({ children }) => <li style={{ margin: '4px 0', fontSize: '14px', lineHeight: '1.6' }}>{children}</li>,
              strong: ({ children }) => <strong style={{ color: '#f1f5f9', fontWeight: '600' }}>{children}</strong>,
              em: ({ children }) => <em style={{ color: '#a78bfa' }}>{children}</em>,
              code: ({ inline, children }) =>
                inline
                  ? <code style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>{children}</code>
                  : <pre style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px', overflow: 'auto', margin: '12px 0' }}><code style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>{children}</code></pre>,
              blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '16px', margin: '12px 0', color: '#a78bfa', fontStyle: 'italic' }}>{children}</blockquote>,
              table: ({ children }) => <div style={{ overflow: 'auto', margin: '12px 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>{children}</table></div>,
              th: ({ children }) => <th style={{ background: '#0f172a', padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#e2e8f0', borderBottom: '2px solid #334155' }}>{children}</th>,
              td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>{children}</td>,
              hr: () => <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '16px 0' }} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '14px',
    overflow: 'hidden',
    marginTop: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: 'rgba(139,92,246,0.05)',
    borderBottom: '1px solid rgba(139,92,246,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  aiIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(139,92,246,0.15)',
    color: '#a78bfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  badge: {
    padding: '3px 8px',
    background: 'rgba(59,130,246,0.1)',
    color: '#93c5fd',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    border: '1px solid rgba(59,130,246,0.2)',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(51,65,85,0.5)',
    border: '1px solid #475569',
    borderRadius: '6px',
    color: '#94a3b8',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  body: {
    padding: '20px',
  },
  markdown: {},
  loadingBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  shimmer: {
    height: '14px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
};
