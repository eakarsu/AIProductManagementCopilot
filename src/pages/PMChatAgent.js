import React, { useState, useEffect, useRef } from 'react';
import { FiCpu, FiSend, FiTrash2, FiZap } from 'react-icons/fi';
import { aiGenerate, aiPrioritize, aiGeneratePRD, aiAssessRisk, aiGenerateStories, roadmapAPI, sprintsAPI, featuresAPI, okrsAPI } from '../services/api';

const TOOL_HINTS = [
  { label: 'Re-prioritize backlog', tool: 'prioritize', payload: 'features' },
  { label: 'Draft PRD for top feature', tool: 'prd', payload: 'features' },
  { label: 'Assess project risks', tool: 'risks', payload: 'risks' },
  { label: 'Generate stories from feature', tool: 'stories', payload: 'features' },
];

export default function PMChatAgent() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your PM Copilot. I have access to your roadmap, features, sprints, and OKRs. Ask me anything or use the quick actions below." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState({ roadmap: [], features: [], sprints: [], okrs: [] });
  const endRef = useRef(null);

  useEffect(() => {
    Promise.all([roadmapAPI.getAll(), featuresAPI.getAll(), sprintsAPI.getAll(), okrsAPI.getAll()])
      .then(([r, f, s, o]) => setCtx({
        roadmap: Array.isArray(r.data) ? r.data : (r.data?.data || []),
        features: Array.isArray(f.data) ? f.data : (f.data?.data || []),
        sprints: Array.isArray(s.data) ? s.data : (s.data?.data || []),
        okrs: Array.isArray(o.data) ? o.data : (o.data?.data || []),
      }));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ctxSummary = `Current state — Roadmap items: ${ctx.roadmap.length} (${ctx.roadmap.filter(r => r.status === 'In Progress').length} in progress), Features: ${ctx.features.length}, Sprints: ${ctx.sprints.length} (${ctx.sprints.filter(s => s.status === 'Active').length} active), OKRs: ${ctx.okrs.length}.`;

  const send = async (textOverride, toolCall = null) => {
    const text = textOverride || input.trim();
    if (!text && !toolCall) return;
    const userMsg = { role: 'user', text: text || `[Tool: ${toolCall.tool}]` };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (toolCall?.tool === 'prioritize') {
        response = await aiPrioritize({ features: ctx.features.slice(0, 20).map(f => ({ title: f.title, description: f.description, effort: f.effort, impact: f.impact })) });
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.content, tool: 'prioritize', parsed: response.data.parsed }]);
      } else if (toolCall?.tool === 'prd') {
        const top = ctx.features[0];
        response = await aiGeneratePRD({ feature: top?.title || 'New Feature', context: ctxSummary });
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.content, tool: 'prd' }]);
      } else if (toolCall?.tool === 'risks') {
        response = await aiAssessRisk({ project: 'Current Roadmap', risks: ctx.features.slice(0, 5).map(f => ({ title: f.title, description: f.description })) });
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.content, tool: 'risks', parsed: response.data.parsed }]);
      } else if (toolCall?.tool === 'stories') {
        const top = ctx.features[0];
        response = await aiGenerateStories({ feature: top?.title || 'Feature', context: top?.description || '' });
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.content, tool: 'stories', parsed: response.data.parsed }]);
      } else {
        response = await aiGenerate({
          prompt: `${ctxSummary}\n\nUser question: ${text}\n\nProvide an actionable, concise PM-grade answer. If a known tool would help (prioritize, generate-prd, assess-risk, generate-stories), suggest invoking it.`,
        });
        setMessages(prev => [...prev, { role: 'assistant', text: response.data.content }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: ' + e.message, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><FiCpu /> PM Chat Agent</h1>
          <p style={styles.sub}>Context-aware chat with tool calls into your roadmap, features, sprints, OKRs</p>
        </div>
        <button onClick={() => setMessages(messages.slice(0, 1))} style={styles.btnSec}><FiTrash2 /> Clear</button>
      </div>

      <div style={styles.contextBar}>
        <FiZap color="#a78bfa" /> <span style={{ color: '#94a3b8', fontSize: 12 }}>{ctxSummary}</span>
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.msg, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#3b82f6' : (m.error ? '#7f1d1d' : '#1e293b') }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, color: m.role === 'user' ? '#dbeafe' : '#94a3b8' }}>
              {m.role === 'user' ? 'You' : 'PM Copilot'} {m.tool && `· tool: ${m.tool}`}
            </div>
            <div style={{ color: m.role === 'user' ? '#fff' : '#e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ ...styles.msg, background: '#1e293b' }}><span style={{ color: '#94a3b8', fontSize: 13 }}>Thinking...</span></div>}
        <div ref={endRef} />
      </div>

      <div style={styles.toolsRow}>
        {TOOL_HINTS.map(t => (
          <button key={t.tool} onClick={() => send(null, t)} disabled={loading} style={styles.toolBtn}>{t.label}</button>
        ))}
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything: 'What's slipping in Q2?', 'Suggest stretch OKR for Growth'..."
          style={styles.input}
          rows={2}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={styles.sendBtn}>
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 },
  title: { color: '#f1f5f9', fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 },
  sub: { color: '#64748b', fontSize: 12, marginTop: 4 },
  btnSec: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  contextBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, marginBottom: 12 },
  chatBox: { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  msg: { padding: '10px 14px', borderRadius: 10, maxWidth: '78%', border: '1px solid rgba(51,65,85,0.5)' },
  toolsRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 },
  toolBtn: { padding: '6px 12px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' },
  inputRow: { display: 'flex', gap: 8, marginTop: 10 },
  input: { flex: 1, padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit', resize: 'none' },
  sendBtn: { padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
