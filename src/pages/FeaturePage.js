import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiChevronLeft, FiCpu, FiSearch } from 'react-icons/fi';
import AIOutput from '../components/AIOutput';
import * as api from '../services/api';

const FEATURE_CONFIG = {
  roadmap: {
    title: 'Product Roadmap',
    api: api.roadmapAPI,
    aiAction: null,
    color: '#3b82f6',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In Progress', 'Completed', 'On Hold'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'quarter', label: 'Quarter', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'progress', label: 'Progress (%)', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
    ],
    columns: ['title', 'status', 'priority', 'quarter', 'owner', 'progress'],
    cardFields: ['status', 'priority', 'quarter', 'owner'],
  },
  features: {
    title: 'Feature Prioritization',
    api: api.featuresAPI,
    aiAction: { label: 'AI Prioritize Features', fn: api.aiPrioritize, buildPayload: (items) => ({ features: items.map(i => ({ title: i.title, description: i.description, effort: i.effort, impact: i.impact })) }) },
    color: '#8b5cf6',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Proposed', 'Under Review', 'Approved', 'In Development', 'Shipped'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'effort', label: 'Effort', type: 'select', options: ['Low', 'Medium', 'High', 'Very High'] },
      { key: 'impact', label: 'Impact', type: 'select', options: ['Low', 'Medium', 'High', 'Very High'] },
      { key: 'score', label: 'Score', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'assignee', label: 'Assignee', type: 'text' },
    ],
    columns: ['title', 'status', 'priority', 'effort', 'impact', 'score'],
    cardFields: ['status', 'priority', 'effort', 'impact', 'score'],
  },
  stories: {
    title: 'User Stories',
    api: api.storiesAPI,
    aiAction: { label: 'AI Generate Stories', fn: api.aiGenerateStories, buildPayload: (items) => ({ feature: 'product features', context: items.slice(0, 5).map(i => i.title).join(', ') }) },
    color: '#10b981',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'acceptance_criteria', label: 'Acceptance Criteria', type: 'textarea' },
      { key: 'story_points', label: 'Story Points', type: 'number' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Backlog', 'Ready', 'In Progress', 'In Review', 'Done'] },
      { key: 'sprint_id', label: 'Sprint ID', type: 'number' },
      { key: 'feature_id', label: 'Feature ID', type: 'number' },
    ],
    columns: ['title', 'status', 'priority', 'story_points'],
    cardFields: ['status', 'priority', 'story_points'],
  },
  sprints: {
    title: 'Sprint Planning',
    api: api.sprintsAPI,
    aiAction: null,
    color: '#f59e0b',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'goal', label: 'Goal', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'Completed', 'Cancelled'] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'velocity', label: 'Velocity', type: 'number' },
    ],
    columns: ['name', 'status', 'start_date', 'end_date', 'capacity', 'velocity'],
    cardFields: ['status', 'capacity', 'velocity'],
  },
  stakeholders: {
    title: 'Stakeholder Management',
    api: api.stakeholdersAPI,
    aiAction: null,
    color: '#ec4899',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'influence', label: 'Influence', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'interest', label: 'Interest', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'communication_preference', label: 'Communication Pref', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: ['name', 'role', 'department', 'influence', 'interest'],
    cardFields: ['role', 'department', 'influence', 'interest'],
  },
  research: {
    title: 'Market Research',
    api: api.researchAPI,
    aiAction: { label: 'AI Market Research', fn: api.aiMarketResearch, buildPayload: (items) => ({ topic: 'Product Management Tools Market', industry: 'SaaS', targetMarket: 'B2B Enterprise' }) },
    color: '#06b6d4',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'market_size', label: 'Market Size', type: 'text' },
      { key: 'growth_rate', label: 'Growth Rate', type: 'text' },
      { key: 'key_trends', label: 'Key Trends', type: 'textarea' },
      { key: 'target_segment', label: 'Target Segment', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'In Progress', 'Completed', 'Archived'] },
    ],
    columns: ['title', 'market_size', 'growth_rate', 'target_segment', 'status'],
    cardFields: ['market_size', 'growth_rate', 'status'],
  },
  competitors: {
    title: 'Competitive Analysis',
    api: api.competitorsAPI,
    aiAction: { label: 'AI Competitive Analysis', fn: api.aiCompetitiveAnalysis, buildPayload: (items) => ({ competitors: items.map(i => i.name), product: 'AI PM Copilot', market: 'Product Management Software' }) },
    color: '#ef4444',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'website', label: 'Website', type: 'text' },
      { key: 'market_share', label: 'Market Share', type: 'text' },
      { key: 'strengths', label: 'Strengths', type: 'textarea' },
      { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
      { key: 'pricing', label: 'Pricing', type: 'text' },
      { key: 'threat_level', label: 'Threat Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    ],
    columns: ['name', 'market_share', 'pricing', 'threat_level'],
    cardFields: ['market_share', 'pricing', 'threat_level'],
  },
  metrics: {
    title: 'Product Metrics & KPIs',
    api: api.metricsAPI,
    aiAction: null,
    color: '#14b8a6',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'current_value', label: 'Current Value', type: 'text' },
      { key: 'target_value', label: 'Target Value', type: 'text' },
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'trend', label: 'Trend', type: 'select', options: ['Up', 'Down', 'Stable'] },
    ],
    columns: ['name', 'current_value', 'target_value', 'unit', 'trend'],
    cardFields: ['current_value', 'target_value', 'trend', 'category'],
  },
  feedback: {
    title: 'Customer Feedback',
    api: api.feedbackAPI,
    aiAction: { label: 'AI Analyze Feedback', fn: api.aiAnalyzeFeedback, buildPayload: (items) => ({ feedback: items.map(i => ({ source: i.source, text: i.feedback_text, sentiment: i.sentiment })) }) },
    color: '#a855f7',
    fields: [
      { key: 'source', label: 'Source', type: 'text', required: true },
      { key: 'customer_name', label: 'Customer Name', type: 'text' },
      { key: 'feedback_text', label: 'Feedback', type: 'textarea' },
      { key: 'sentiment', label: 'Sentiment', type: 'select', options: ['Positive', 'Neutral', 'Negative', 'Mixed'] },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['New', 'Reviewing', 'Addressed', 'Closed'] },
      { key: 'feature_request', label: 'Feature Request', type: 'textarea' },
    ],
    columns: ['customer_name', 'source', 'sentiment', 'category', 'priority', 'status'],
    cardFields: ['source', 'sentiment', 'priority', 'status'],
  },
  releases: {
    title: 'Release Management',
    api: api.releasesAPI,
    aiAction: null,
    color: '#f97316',
    fields: [
      { key: 'version', label: 'Version', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Development', 'Testing', 'Staging', 'Released', 'Rolled Back'] },
      { key: 'release_date', label: 'Release Date', type: 'date' },
      { key: 'features_count', label: 'Features Count', type: 'number' },
      { key: 'bug_fixes_count', label: 'Bug Fixes Count', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: ['version', 'name', 'status', 'release_date', 'features_count', 'bug_fixes_count'],
    cardFields: ['version', 'status', 'release_date'],
  },
  abtests: {
    title: 'A/B Test Planning',
    api: api.abtestsAPI,
    aiAction: null,
    color: '#06b6d4',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'hypothesis', label: 'Hypothesis', type: 'textarea' },
      { key: 'variant_a', label: 'Variant A', type: 'textarea' },
      { key: 'variant_b', label: 'Variant B', type: 'textarea' },
      { key: 'metric', label: 'Metric', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Running', 'Paused', 'Completed', 'Cancelled'] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'winner', label: 'Winner', type: 'select', options: ['', 'A', 'B', 'Inconclusive'] },
      { key: 'results', label: 'Results', type: 'textarea' },
    ],
    columns: ['name', 'status', 'metric', 'start_date', 'winner'],
    cardFields: ['status', 'metric', 'winner'],
  },
  requirements: {
    title: 'Product Requirements',
    api: api.requirementsAPI,
    aiAction: { label: 'AI Generate PRD', fn: api.aiGeneratePRD, buildPayload: (items) => ({ feature: items[0]?.title || 'New Feature', context: items.map(i => i.title).join(', ') }) },
    color: '#8b5cf6',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'type', label: 'Type', type: 'select', options: ['Functional', 'Non-Functional', 'Technical', 'Business', 'Compliance'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Review', 'Approved', 'Implemented', 'Deferred'] },
      { key: 'acceptance_criteria', label: 'Acceptance Criteria', type: 'textarea' },
      { key: 'stakeholder', label: 'Stakeholder', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' },
    ],
    columns: ['title', 'type', 'priority', 'status', 'stakeholder'],
    cardFields: ['type', 'priority', 'status', 'stakeholder'],
  },
  risks: {
    title: 'Risk Assessment',
    api: api.risksAPI,
    aiAction: { label: 'AI Assess Risks', fn: api.aiAssessRisk, buildPayload: (items) => ({ project: 'AI PM Copilot', risks: items.map(i => ({ title: i.title, description: i.description })) }) },
    color: '#ef4444',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'probability', label: 'Probability', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'impact', label: 'Impact', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'risk_score', label: 'Risk Score', type: 'number' },
      { key: 'mitigation', label: 'Mitigation', type: 'textarea' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Identified', 'Analyzing', 'Mitigating', 'Resolved', 'Accepted'] },
      { key: 'category', label: 'Category', type: 'text' },
    ],
    columns: ['title', 'probability', 'impact', 'risk_score', 'status', 'owner'],
    cardFields: ['probability', 'impact', 'risk_score', 'status'],
  },
  capacity: {
    title: 'Team Capacity',
    api: api.capacityAPI,
    aiAction: null,
    color: '#10b981',
    fields: [
      { key: 'member_name', label: 'Member Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'availability_percent', label: 'Availability (%)', type: 'number' },
      { key: 'sprint_id', label: 'Sprint ID', type: 'number' },
      { key: 'allocated_hours', label: 'Allocated Hours', type: 'number' },
      { key: 'skills', label: 'Skills', type: 'textarea' },
      { key: 'current_load', label: 'Current Load', type: 'select', options: ['Light', 'Normal', 'Heavy', 'Overloaded'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: ['member_name', 'role', 'availability_percent', 'allocated_hours', 'current_load'],
    cardFields: ['role', 'availability_percent', 'current_load'],
  },
  okrs: {
    title: 'OKR Tracking',
    api: api.okrsAPI,
    aiAction: null,
    color: '#f59e0b',
    fields: [
      { key: 'objective', label: 'Objective', type: 'textarea', required: true },
      { key: 'key_result', label: 'Key Result', type: 'textarea' },
      { key: 'progress', label: 'Progress (%)', type: 'number' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'quarter', label: 'Quarter', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Active', 'At Risk', 'Completed', 'Cancelled'] },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'target_value', label: 'Target Value', type: 'text' },
      { key: 'current_value', label: 'Current Value', type: 'text' },
    ],
    columns: ['objective', 'key_result', 'progress', 'owner', 'status'],
    cardFields: ['progress', 'owner', 'status', 'quarter'],
  },
};

function getDisplayName(item, config) {
  return item.title || item.name || item.member_name || item.objective || item.version || item.source || `Item #${item.id}`;
}

function StatusBadge({ value }) {
  if (!value) return <span style={{ color: '#64748b' }}>-</span>;
  const colors = {
    'completed': '#10b981', 'done': '#10b981', 'shipped': '#10b981', 'released': '#10b981', 'resolved': '#10b981',
    'in progress': '#3b82f6', 'active': '#3b82f6', 'running': '#3b82f6', 'in development': '#3b82f6',
    'planned': '#f59e0b', 'planning': '#f59e0b', 'draft': '#f59e0b', 'backlog': '#f59e0b', 'proposed': '#f59e0b',
    'on hold': '#64748b', 'paused': '#64748b', 'cancelled': '#64748b', 'deferred': '#64748b',
    'high': '#ef4444', 'critical': '#ef4444', 'overloaded': '#ef4444', 'negative': '#ef4444',
    'medium': '#f59e0b', 'normal': '#f59e0b', 'mixed': '#f59e0b', 'neutral': '#f59e0b',
    'low': '#10b981', 'light': '#10b981', 'positive': '#10b981',
    'up': '#10b981', 'down': '#ef4444', 'stable': '#64748b',
    'at risk': '#ef4444', 'very high': '#ef4444',
  };
  const color = colors[value.toLowerCase()] || '#94a3b8';
  return (
    <span style={{ padding: '3px 10px', background: `${color}15`, color, borderRadius: '20px', fontSize: '12px', fontWeight: '500', border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = parseInt(value) || 0;
  const color = v >= 80 ? '#10b981' : v >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ width: `${v}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '32px' }}>{v}%</span>
    </div>
  );
}

function CellValue({ field, value }) {
  if (value === null || value === undefined) return <span style={{ color: '#475569' }}>-</span>;
  const str = String(value);
  if (field === 'progress' || field === 'availability_percent') return <ProgressBar value={value} />;
  if (['status', 'priority', 'effort', 'impact', 'influence', 'interest', 'threat_level', 'current_load', 'sentiment', 'trend', 'probability', 'type', 'winner'].includes(field)) return <StatusBadge value={str} />;
  if (field.includes('date') && str) return <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{new Date(str).toLocaleDateString()}</span>;
  if (field === 'score' || field === 'risk_score') return <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>{str}</span>;
  if (str.length > 60) return <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{str.substring(0, 60)}...</span>;
  return <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{str}</span>;
}

export default function FeaturePage() {
  const { feature } = useParams();
  const config = FEATURE_CONFIG[feature];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchItems = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await config.api.getAll();
      setItems(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    setSelectedItem(null);
    setShowForm(false);
    setAiContent('');
    setAiError('');
    setSearchTerm('');
    fetchItems();
  }, [feature, fetchItems]);

  if (!config) return <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '80px', fontSize: '18px' }}>Feature not found</div>;

  const handleNew = () => {
    const initial = {};
    config.fields.forEach(f => { initial[f.key] = ''; });
    setFormData(initial);
    setEditMode(false);
    setShowForm(true);
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    const data = {};
    config.fields.forEach(f => {
      let val = item[f.key];
      if (f.type === 'date' && val) val = val.substring(0, 10);
      data[f.key] = val || '';
    });
    setFormData(data);
    setEditMode(true);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedItem) {
        await config.api.update(selectedItem.id, formData);
      } else {
        await config.api.create(formData);
      }
      setShowForm(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await config.api.delete(id);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleAI = async () => {
    if (!config.aiAction) return;
    setAiLoading(true);
    setAiError('');
    setAiContent('');
    try {
      const payload = config.aiAction.buildPayload(items);
      const res = await config.aiAction.fn(payload);
      setAiContent(res.data.content);
    } catch (err) {
      setAiError(err.response?.data?.details || err.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some(v => v && String(v).toLowerCase().includes(term));
  });

  // Detail View
  if (selectedItem && !showForm) {
    return (
      <div>
        <button onClick={() => setSelectedItem(null)} style={styles.backBtn}>
          <FiChevronLeft size={18} /> Back to List
        </button>
        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <h2 style={{ ...styles.detailTitle, color: config.color }}>{getDisplayName(selectedItem, config)}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(selectedItem)} style={styles.editBtn}><FiEdit2 size={16} /> Edit</button>
              <button onClick={() => handleDelete(selectedItem.id)} style={styles.deleteBtn}><FiTrash2 size={16} /> Delete</button>
            </div>
          </div>
          <div style={styles.detailGrid}>
            {config.fields.map(f => (
              <div key={f.key} style={styles.detailField}>
                <label style={styles.detailLabel}>{f.label}</label>
                <div style={styles.detailValue}>
                  <CellValue field={f.key} value={selectedItem[f.key]} />
                </div>
              </div>
            ))}
          </div>
          <div style={styles.detailMeta}>
            <span>ID: {selectedItem.id}</span>
            <span>Created: {new Date(selectedItem.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); }} style={styles.backBtn}>
          <FiChevronLeft size={18} /> Cancel
        </button>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editMode ? 'Edit Item' : 'New Item'}</h2>
          <div style={styles.formGrid}>
            {config.fields.map(f => (
              <div key={f.key} style={{ ...styles.formGroup, gridColumn: f.type === 'textarea' ? '1 / -1' : 'auto' }}>
                <label style={styles.formLabel}>{f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    style={styles.textarea}
                    rows={3}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    style={styles.input}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={styles.formActions}>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
            <button onClick={handleSave} style={styles.saveBtn}><FiSave size={16} /> {editMode ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={{ ...styles.pageTitle, color: config.color }}>{config.title}</h1>
          <p style={styles.pageCount}>{filtered.length} items</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={styles.searchWrap}>
            <FiSearch style={styles.searchIcon} />
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          {config.aiAction && (
            <button onClick={handleAI} style={styles.aiBtn} disabled={aiLoading}>
              <FiCpu size={16} /> {config.aiAction.label}
            </button>
          )}
          <button onClick={handleNew} style={{ ...styles.newBtn, background: config.color }}>
            <FiPlus size={16} /> New Item
          </button>
        </div>
      </div>

      {(aiContent || aiLoading || aiError) && (
        <AIOutput content={aiContent} loading={aiLoading} error={aiError} />
      )}

      {loading ? (
        <div style={styles.loadingMsg}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyMsg}>No items found. Click "New Item" to create one.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {config.columns.map(col => (
                  <th key={col} style={styles.th}>
                    {config.fields.find(f => f.key === col)?.label || col}
                  </th>
                ))}
                <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr
                  key={item.id}
                  style={styles.tr}
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {config.columns.map(col => (
                    <td key={col} style={styles.td}>
                      <CellValue field={col} value={item[col]} />
                    </td>
                  ))}
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        style={styles.actionBtn}
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        style={{ ...styles.actionBtn, color: '#ef4444' }}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  pageCount: {
    color: '#64748b',
    fontSize: '13px',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '10px 12px 10px 36px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '13px',
    width: '200px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  aiBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: 'rgba(139,92,246,0.1)',
    color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    overflow: 'auto',
    marginTop: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #334155',
    background: 'rgba(15,23,42,0.5)',
    whiteSpace: 'nowrap',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(51,65,85,0.5)',
    verticalAlign: 'middle',
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  loadingMsg: {
    textAlign: 'center',
    color: '#64748b',
    padding: '60px 0',
    fontSize: '15px',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#64748b',
    padding: '60px 0',
    fontSize: '15px',
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    marginTop: '16px',
  },
  // Detail view
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '16px',
    fontFamily: 'inherit',
  },
  detailCard: {
    background: '#1e293b',
    borderRadius: '14px',
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap',
    gap: '12px',
  },
  detailTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(59,130,246,0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1px',
    background: 'rgba(51,65,85,0.3)',
  },
  detailField: {
    padding: '16px 24px',
    background: '#1e293b',
  },
  detailLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#e2e8f0',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  detailMeta: {
    display: 'flex',
    gap: '24px',
    padding: '14px 24px',
    borderTop: '1px solid #334155',
    fontSize: '12px',
    color: '#475569',
  },
  // Form
  formCard: {
    background: '#1e293b',
    borderRadius: '14px',
    border: '1px solid #334155',
    padding: '28px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  formGroup: {},
  formLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #334155',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
