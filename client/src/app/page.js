"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Plus, 
  ChevronDown,
  User, 
  ShieldAlert, 
  FileText,
  ThumbsUp,
  History,
  Trash2,
  X,
  Search,
  Link as LinkIcon,
  MoreHorizontal,
  Filter,
  Crown,
  Save,
  RotateCcw,
  Calendar,
  Download,
  Activity,
  Briefcase,
  Server,
  Tag,
  BarChart3
} from 'lucide-react';

// --- Constants & Mock Data ---

const STATUS_FLOW = ['Open', 'In Process', 'Pending Confirm', 'Resolved'];
const EFFORT_LEVELS = ['Low', 'Medium', 'High', 'Extreme'];
const ENVIRONMENTS = ['Development', 'Staging', 'Production', 'Disaster Recovery'];
const PROJECTS = ['Alpha API', 'Beta Frontend', 'Gamma DB', 'Delta Auth'];
const ISSUE_TYPES = ['Bug', 'Incident', 'Change Request', 'Vulnerability'];
const ROOT_CAUSE_CATS = ['Code Error', 'Configuration', 'Infrastructure', 'Third Party', 'Human Error', 'Capacity'];
const RISK_OPTIONS = ['Data Loss', 'Security Breach', 'Compliance Violation', 'Financial Impact', 'Reputation Damage', 'SLA Breach'];
const MOCK_USERS = ['Alice Engineer', 'Bob Manager', 'Charlie Director', 'Diana VP', 'Evan CTO', 'Frank External'];

const INITIAL_DATA = [
  {
    id: '1',
    title: 'Production Latency Spike in API Gateway',
    status: 'In Process',
    created: new Date(Date.now() - 86400000 * 2).toISOString(),
    
    // New Fields
    reportedBy: 'Alice Engineer',
    reportedAt: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 16),
    environment: 'Production',
    project: 'Alpha API',
    issueType: 'Incident',
    assignee: 'Bob Manager',
    
    // Context
    context: 'Observed during peak load on Monday.',
    problemStatement: 'API response times increased by 400% causing timeouts.',
    evidence: 'Grafana dashboards screenshot attached (mock).',
    
    // Risks
    risks: ['SLA Breach', 'Reputation Damage'],
    riskScore: 15, // Calculated (e.g. 5 points for SLA, 10 for Reputation)

    // Analysis
    rootCauseCategory: 'Capacity',
    rootCause: 'Insufficient connection pool settings for peak traffic.',
    
    // Resolution
    closedAt: '',

    escalations: [
      { 
        id: 101, 
        layer: 1, 
        stakeholders: [
          { name: 'Bob Manager', isDecisionMaker: true },
          { name: 'Alice Engineer', isDecisionMaker: false }
        ], 
        status: 'Done' 
      }
    ],
    resolutions: [
      { 
        id: 201, 
        solution: 'Scale up AWS instances vertically', 
        pros: 'Quick to implement', 
        cons: 'High cost increase', 
        concerns: 'Might hit quotas', 
        effort: 'Low', 
        isAgreed: false 
      }
    ],
    comments: [
      { id: 301, user: 'Alice Engineer', text: 'I checked the logs, looks like database locking.', timestamp: new Date().toISOString() }
    ],
    auditLog: [
      { id: 401, action: 'Issue Created', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 402, action: 'Status changed to In Process', timestamp: new Date(Date.now() - 40000000).toISOString() }
    ]
  }
];

// --- Helper Components ---

const StatusBadge = ({ status }) => {
  const colors = {
    'Open': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Process': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Pending Confirm': 'bg-purple-100 text-purple-800 border-purple-200',
    'Resolved': 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
      <h3 className="font-semibold text-slate-700 truncate text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

const PrettySelect = ({ value, onChange, options, icon: Icon, className = "", name, label }) => (
  <div className={`relative ${className}`}>
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>}
    <div className="relative group">
        {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
            <Icon className="w-4 h-4" />
        </div>
        )}
        <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
            appearance-none w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg 
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block 
            ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2 
            transition-all hover:border-indigo-300 cursor-pointer shadow-sm font-medium truncate
        `}
        >
        <option value="">Select...</option>
        {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
        <ChevronDown className="w-4 h-4" />
        </div>
    </div>
  </div>
);

const AutoTextArea = ({ value, onChange, className, placeholder, minRows = 1 }) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-lg transition-all outline-none resize-none p-2 -ml-2 ${className}`}
      rows={minRows}
    />
  );
};

// --- Risk Multi-Select Component ---

const RisksInput = ({ selectedRisks = [], onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
  
    const available = RISK_OPTIONS.filter(r => !selectedRisks.includes(r));
  
    const addRisk = (risk) => {
      onChange([...selectedRisks, risk]);
      setIsOpen(false);
    };
  
    const removeRisk = (risk) => {
      onChange(selectedRisks.filter(r => r !== risk));
    };
  
    return (
      <div className="relative" ref={wrapperRef}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Risks Identified</label>
        <div 
          className="min-h-[38px] w-full bg-white border border-slate-300 rounded-lg px-2 py-1 flex flex-wrap items-center gap-1.5 cursor-pointer hover:border-indigo-300 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedRisks.length === 0 && <span className="text-sm text-slate-400 p-1">No risks selected</span>}
          {selectedRisks.map(risk => (
            <span key={risk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-100">
              {risk}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); removeRisk(risk); }}
                className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="ml-auto">
             <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
  
        {isOpen && available.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
            {available.map(risk => (
              <button
                key={risk}
                type="button"
                onClick={() => addRisk(risk)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between group text-slate-700"
              >
                {risk}
              </button>
            ))}
          </div>
        )}
      </div>
    );
};

// --- Modal Component ---

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full md:h-[95vh] md:rounded-2xl md:max-w-6xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-none">
        <div className="px-4 md:px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex-1 pr-4 overflow-hidden">{title}</div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-4 md:px-6 py-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function IssueTracker() {
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingIssue, setEditingIssue] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('issueTrackerData');
    if (saved) setIssues(JSON.parse(saved));
    else setIssues(INITIAL_DATA);
  }, []);

  // Save data
  useEffect(() => {
    if (issues.length > 0) localStorage.setItem('issueTrackerData', JSON.stringify(issues));
  }, [issues]);

  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.id.includes(searchTerm) ||
    i.project?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Status Summary Counts ---
  const getStatusCounts = () => {
    const counts = { 'Open': 0, 'In Process': 0, 'Pending Confirm': 0, 'Resolved': 0 };
    filteredIssues.forEach(i => {
      if (counts[i.status] !== undefined) counts[i.status]++;
    });
    return counts;
  };
  const statusCounts = getStatusCounts();

  // --- CSV Export ---
  const exportToCSV = () => {
    if (filteredIssues.length === 0) return;

    // Define headers
    const headers = [
      'ID', 'Title', 'Status', 'Project', 'Issue Type', 
      'Reported By', 'Reported At', 'Environment', 'Risk Score', 'Risks', 
      'Assignee', 'Root Cause Category'
    ];

    // Map data to rows
    const rows = filteredIssues.map(issue => [
      issue.id,
      `"${(issue.title || '').replace(/"/g, '""')}"`, // Escape quotes
      issue.status,
      issue.project,
      issue.issueType,
      issue.reportedBy,
      new Date(issue.reportedAt).toLocaleString(),
      issue.environment,
      issue.riskScore,
      `"${(issue.risks || []).join(', ')}"`,
      issue.assignee,
      issue.rootCauseCategory
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IssueTracker_Export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Actions ---

  const handleSave = () => {
    if (!editingIssue) return;

    if (isCreating) {
      const newId = Date.now().toString();
      const finalIssue = {
        ...editingIssue,
        id: newId,
        created: new Date().toISOString(),
        auditLog: editingIssue.auditLog.map(log => ({ ...log, timestamp: new Date().toISOString() }))
      };
      setIssues([finalIssue, ...issues]);
    } else {
      setIssues(prev => prev.map(i => i.id === editingIssue.id ? editingIssue : i));
    }
    closeModal();
  };

  // --- Edit Actions (Applied to `editingIssue`) ---

  const updateDraftField = (field, value) => {
    setEditingIssue(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const updateRisks = (newRisks) => {
    setEditingIssue(prev => {
        if (!prev) return null;
        const score = newRisks.length * 10;
        return { ...prev, risks: newRisks, riskScore: score };
    });
  };

  const addDraftAuditLog = (action) => {
    setEditingIssue(prev => {
        if (!prev) return null;
        return {
            ...prev,
            auditLog: [...prev.auditLog, { id: Date.now(), action, timestamp: new Date().toISOString() }]
        };
    });
  };

  const updateStatus = (newStatus) => {
    updateDraftField('status', newStatus);
    addDraftAuditLog(`Status changed to ${newStatus}`);
  };

  const openCreateModal = () => {
    const blankIssue = {
      id: 'new',
      title: '',
      status: 'Open',
      created: new Date().toISOString(),
      // New Field Defaults
      reportedBy: '',
      reportedAt: new Date().toISOString().slice(0, 16), // format for datetime-local
      environment: 'Development',
      project: '',
      issueType: 'Bug',
      rootCauseCategory: '',
      rootCause: '',
      assignee: '',
      closedAt: '',
      risks: [],
      riskScore: 0,
      // Standard Fields
      context: '',
      problemStatement: '',
      evidence: '',
      escalations: [],
      resolutions: [],
      comments: [],
      auditLog: [{ id: Date.now(), action: 'Draft Started', timestamp: new Date().toISOString() }]
    };
    
    setEditingIssue(blankIssue);
    setIsCreating(true);
    setActiveTab('overview');
  };

  const openViewModal = (id) => {
    const issueToEdit = issues.find(i => i.id === id);
    if (issueToEdit) {
      setEditingIssue(JSON.parse(JSON.stringify(issueToEdit)));
      setIsCreating(false);
      setActiveTab('overview');
    }
  };

  const closeModal = () => {
    setEditingIssue(null);
    setIsCreating(false);
  };

  // --- Sub Components Logic (Safe Guards) ---
  
  const addEscalationLayer = () => {
    if (!editingIssue) return;
    const layerNum = editingIssue.escalations.length + 1;
    const newLayer = { id: Date.now(), layer: layerNum, stakeholders: [], status: 'Pending' };
    setEditingIssue(prev => (prev ? { ...prev, escalations: [...prev.escalations, newLayer] } : null));
  };

  const updateEscalationStatus = (layerId, newStatus) => {
    setEditingIssue(prev => {
      if (!prev) return null;
      return { ...prev, escalations: prev.escalations.map(e => e.id === layerId ? { ...e, status: newStatus } : e) };
    });
  };

  const addStakeholder = (layerId, userName) => {
    if (!userName) return;
    setEditingIssue(prev => {
      if (!prev) return null;
      return { ...prev, escalations: prev.escalations.map(layer => {
        if (layer.id !== layerId) return layer;
        if (layer.stakeholders.some(s => s.name === userName)) return layer;
        const isFirst = layer.stakeholders.length === 0;
        return { ...layer, stakeholders: [...layer.stakeholders, { name: userName, isDecisionMaker: isFirst }] };
      }) };
    });
  };

  const removeStakeholder = (layerId, userName) => {
    setEditingIssue(prev => {
      if (!prev) return null;
      return { ...prev, escalations: prev.escalations.map(layer => {
        if (layer.id !== layerId) return layer;
        return { ...layer, stakeholders: layer.stakeholders.filter(s => s.name !== userName) };
      }) };
    });
  };

  const setDecisionMaker = (layerId, userName) => {
    setEditingIssue(prev => {
      if (!prev) return null;
      return { ...prev, escalations: prev.escalations.map(layer => {
        if (layer.id !== layerId) return layer;
        return { ...layer, stakeholders: layer.stakeholders.map(s => ({ ...s, isDecisionMaker: s.name === userName })) };
      }) };
    });
  };

  const addResolution = (e) => {
    e.preventDefault();
    if (!editingIssue) return;
    const formData = new FormData(e.target);
    const newRes = {
      id: Date.now(),
      solution: formData.get('solution'),
      pros: formData.get('pros'),
      cons: formData.get('cons'),
      concerns: formData.get('concerns'),
      effort: formData.get('effort'),
      isAgreed: false
    };
    setEditingIssue(prev => (prev ? { ...prev, resolutions: [...prev.resolutions, newRes] } : null));
    e.target.reset();
  };

  const toggleAgreement = (resId) => {
    setEditingIssue(prev => {
        if (!prev) return null;
        return { ...prev, resolutions: prev.resolutions.map(r => ({ ...r, isAgreed: r.id === resId ? !r.isAgreed : false })) };
    });
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!editingIssue) return;
    const text = e.target.comment.value;
    if (!text) return;
    setEditingIssue(prev => (prev ? { ...prev, comments: [...prev.comments, { id: Date.now(), user: 'Current User', text, timestamp: new Date().toISOString() }] } : null));
    e.target.reset();
  };

  const visibleTabs = ['overview', 'escalations', 'resolutions'];
  if (!isCreating) visibleTabs.push('history');

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 md:p-8">
      
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg"><FileText className="text-white w-5 h-5 md:w-6 md:h-6"/></div>
             IssueTracker
           </h1>
           <p className="text-slate-500 mt-2 text-sm md:text-base">Manage critical incidents, escalations, and resolutions.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={exportToCSV}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-xl transition-all font-semibold shadow-sm"
            >
                <Download className="w-5 h-5" /> Export CSV
            </button>
            <button 
                onClick={openCreateModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl transition-all font-semibold shadow-lg shadow-indigo-200"
            >
                <Plus className="w-5 h-5" /> New Issue
            </button>
        </div>
      </div>

      {/* Summary Blocks */}
      <div className="max-w-7xl mx-auto mb-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATUS_FLOW.map(status => {
                let borderClass = 'border-slate-200';
                let bgClass = 'bg-white';
                let textClass = 'text-slate-700';
                
                if(status === 'Open') { borderClass = 'border-blue-200'; bgClass = 'bg-blue-50/50'; textClass = 'text-blue-700'; }
                if(status === 'In Process') { borderClass = 'border-yellow-200'; bgClass = 'bg-yellow-50/50'; textClass = 'text-yellow-700'; }
                if(status === 'Pending Confirm') { borderClass = 'border-purple-200'; bgClass = 'bg-purple-50/50'; textClass = 'text-purple-700'; }
                if(status === 'Resolved') { borderClass = 'border-green-200'; bgClass = 'bg-green-50/50'; textClass = 'text-green-700'; }

                return (
                    <div key={status} className={`p-4 rounded-xl border ${borderClass} ${bgClass} shadow-sm flex flex-col justify-between h-24 transition-transform hover:scale-[1.02]`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>{status}</span>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-extrabold text-slate-800">{statusCounts[status]}</span>
                            <Activity className={`w-5 h-5 opacity-20 ${textClass}`} />
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      {/* Issue Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    placeholder="Search by title, ID, project..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
            <table className="hidden md:table w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-6 py-4 w-20">ID</th>
                <th className="px-6 py-4">Issue Title</th>
                <th className="px-6 py-4 w-32">Project</th>
                <th className="px-6 py-4 w-32">Type</th>
                <th className="px-6 py-4 w-32">Status</th>
                <th className="px-6 py-4 w-40">Reported At</th>
                <th className="px-6 py-4 w-24 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredIssues.map(issue => (
                <tr 
                    key={issue.id} 
                    onClick={() => openViewModal(issue.id)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{issue.id.slice(-4)}</td>
                    <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{issue.title}</span>
                    {issue.riskScore > 30 && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" title="High Risk"></span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{issue.project}</td>
                    <td className="px-6 py-4 text-sm text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{issue.issueType}</span></td>
                    <td className="px-6 py-4">
                    <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {new Date(issue.reportedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 group-hover:text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredIssues.map(issue => (
            <div key={issue.id} onClick={() => openViewModal(issue.id)} className="p-4 active:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={issue.status} />
                <span className="text-xs text-slate-400 font-mono">#{issue.id.slice(-4)}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{issue.title}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                 <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{issue.project}</span>
                 <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{issue.issueType}</span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs text-slate-500">{new Date(issue.reportedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UNIFIED MODAL */}
      <Modal 
        isOpen={!!editingIssue} 
        onClose={closeModal} 
        footer={
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            <div className="text-xs md:text-sm text-slate-500 italic text-center md:text-left">
              <span className="font-semibold text-indigo-600">{isCreating ? 'Draft Mode' : 'Editing Mode'}:</span> Changes require saving.
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button onClick={closeModal} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                <RotateCcw className="w-4 h-4" /> {isCreating ? 'Cancel' : 'Discard'}
              </button>
              <button onClick={handleSave} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all">
                <Save className="w-4 h-4" /> {isCreating ? 'Create Issue' : 'Save Changes'}
              </button>
            </div>
          </div>
        }
        title={
          editingIssue && (
            <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                         {!isCreating && <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">#{editingIssue.id.slice(-4)}</span>}
                         <div className="md:hidden"><StatusBadge status={editingIssue.status} /></div>
                    </div>
                </div>
              <input 
                value={editingIssue.title} 
                onChange={(e) => updateDraftField('title', e.target.value)}
                placeholder="Enter Issue Title..."
                className="font-bold text-lg md:text-xl text-slate-800 bg-transparent border-none focus:ring-0 focus:border-b focus:border-indigo-500 rounded-none px-0 w-full transition-colors placeholder-slate-300"
              />
            </div>
          )
        }
      >
        {editingIssue && (
          <div className="flex flex-col h-full bg-slate-50/30">
            
            {/* Scrollable Tabs Header */}
            <div className="flex w-full border-b border-slate-200 bg-white sticky top-0 z-30 overflow-x-auto no-scrollbar px-4 md:px-6 shadow-sm">
                <div className="flex flex-nowrap min-w-full">
                    {visibleTabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 mr-6 md:mr-8 text-sm font-bold border-b-[3px] transition-colors capitalize whitespace-nowrap shrink-0 ${
                        activeTab === tab 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab === 'history' ? 'Audit Trail' : tab}
                    </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 min-h-[400px]">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Left Column: Core Information */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card title="Issue Details" icon={Briefcase}>
                                        <div className="space-y-3">
                                            <PrettySelect label="Project" name="project" options={PROJECTS} value={editingIssue.project} onChange={e => updateDraftField('project', e.target.value)} />
                                            <PrettySelect label="Environment" name="environment" options={ENVIRONMENTS} value={editingIssue.environment} onChange={e => updateDraftField('environment', e.target.value)} />
                                            <PrettySelect label="Issue Type" name="issueType" options={ISSUE_TYPES} value={editingIssue.issueType} onChange={e => updateDraftField('issueType', e.target.value)} />
                                        </div>
                                    </Card>
                                    <Card title="Reporting" icon={User}>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Reported By</label>
                                                <input value={editingIssue.reportedBy} onChange={e => updateDraftField('reportedBy', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Name..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Reported At</label>
                                                <input type="datetime-local" value={editingIssue.reportedAt} onChange={e => updateDraftField('reportedAt', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </div>
                                            <PrettySelect label="Current Assignee" name="assignee" options={MOCK_USERS} value={editingIssue.assignee} onChange={e => updateDraftField('assignee', e.target.value)} />
                                        </div>
                                    </Card>
                                </div>

                                <Card title="Description" icon={FileText}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Context</label>
                                            <AutoTextArea value={editingIssue.context} onChange={e => updateDraftField('context', e.target.value)} placeholder="What is happening?" className="text-slate-700" minRows={2} />
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                            <label className="block text-xs font-bold text-red-800 uppercase tracking-wide mb-1">Problem Statement</label>
                                            <AutoTextArea value={editingIssue.problemStatement} onChange={e => updateDraftField('problemStatement', e.target.value)} placeholder="Define the core problem..." className="text-red-900 font-medium" minRows={2} />
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Analysis & Evidence" icon={Activity}>
                                     <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Evidence / Logs</label>
                                            <AutoTextArea value={editingIssue.evidence} onChange={e => updateDraftField('evidence', e.target.value)} placeholder="Paste logs here..." className="font-mono text-xs bg-slate-50 border-slate-200 rounded-lg min-h-[100px]" minRows={4} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <PrettySelect label="Root Cause Category" name="rootCauseCategory" options={ROOT_CAUSE_CATS} value={editingIssue.rootCauseCategory} onChange={e => updateDraftField('rootCauseCategory', e.target.value)} />
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Root Cause Detail</label>
                                                <AutoTextArea value={editingIssue.rootCause} onChange={e => updateDraftField('rootCause', e.target.value)} placeholder="Explain why..." className="text-slate-700" minRows={2} />
                                            </div>
                                        </div>
                                     </div>
                                </Card>

                                {/* Comments - Hidden on Create */}
                                {!isCreating && (
                                    <Card title="Discussion" icon={MessageSquare}>
                                        <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                                            {editingIssue.comments.length === 0 && <p className="text-slate-400 italic text-sm">No comments yet.</p>}
                                            {editingIssue.comments.map(comment => (
                                                <div key={comment.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span className="font-bold text-slate-700">{comment.user}</span>
                                                        <span>{new Date(comment.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p>{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={addComment} className="flex gap-2">
                                            <input name="comment" placeholder="Add comment..." className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm" />
                                            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded text-sm">Post</button>
                                        </form>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column: Meta, Risk, Resolution */}
                            <div className="space-y-6">
                                <Card title="Status" icon={Activity}>
                                    <div className="space-y-4">
                                        <PrettySelect label="Current Status" name="status" options={STATUS_FLOW} value={editingIssue.status} onChange={e => updateStatus(e.target.value)} />
                                    </div>
                                </Card>

                                <Card title="Risk Assessment" icon={ShieldAlert}>
                                    <div className="space-y-4">
                                        <RisksInput selectedRisks={editingIssue.risks || []} onChange={updateRisks} />
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Risk Score (Calculated)</label>
                                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-700 flex justify-between items-center">
                                                <span>{editingIssue.riskScore || 0}</span>
                                                <span className="text-xs font-normal text-slate-400">View Only</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Final Resolution" icon={CheckCircle2}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Closed At</label>
                                            <input type="datetime-local" value={editingIssue.closedAt} onChange={e => updateDraftField('closedAt', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* ESCALATIONS TAB */}
                    {activeTab === 'escalations' && (
                         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800">Escalation Matrix</h3>
                                 <p className="text-sm text-slate-500">Manage support tiers.</p>
                             </div>
                             <button 
                             onClick={addEscalationLayer}
                             disabled={editingIssue.escalations.length > 0 && editingIssue.escalations[editingIssue.escalations.length - 1].status !== 'Done'}
                             className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                 (editingIssue.escalations.length === 0 || editingIssue.escalations[editingIssue.escalations.length - 1].status === 'Done')
                                 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                             }`}
                             >
                             <ShieldAlert className="w-4 h-4" /> Escalate to Next Layer
                             </button>
                         </div>
 
                         <div className="space-y-4">
                             {editingIssue.escalations.length === 0 && (
                             <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                                 <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                 <p>No escalations triggered yet.</p>
                             </div>
                             )}
                             {editingIssue.escalations.map((esc) => (
                             <div key={esc.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm relative overflow-hidden">
                                 <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b border-slate-100 gap-4">
                                   <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0 ${
                                       esc.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                     }`}>
                                       {esc.layer}
                                     </div>
                                     <div>
                                       <h4 className="font-bold text-slate-800">Level {esc.layer} Escalation</h4>
                                       <div className="flex bg-slate-100 rounded-lg p-0.5 mt-1 w-fit">
                                         <button 
                                           onClick={() => updateEscalationStatus(esc.id, 'Pending')}
                                           className={`px-3 py-0.5 text-[10px] rounded uppercase tracking-wide font-bold transition-all ${esc.status === 'Pending' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                         >
                                           Pending
                                         </button>
                                         <button 
                                           onClick={() => updateEscalationStatus(esc.id, 'Done')}
                                           className={`px-3 py-0.5 text-[10px] rounded uppercase tracking-wide font-bold transition-all ${esc.status === 'Done' ? 'bg-green-500 shadow text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                         >
                                           Done
                                         </button>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
 
                                 <div>
                                   <div className="flex items-center justify-between mb-3">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stakeholders</label>
                                     <div className="relative group">
                                       <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                                         <Plus className="w-3 h-3" /> Add Person
                                       </button>
                                       <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-1 hidden group-hover:block z-20">
                                         {MOCK_USERS
                                           .filter(u => !esc.stakeholders.some(s => s.name === u))
                                           .map(user => (
                                             <button 
                                               key={user}
                                               onClick={() => addStakeholder(esc.id, user)}
                                               className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded font-medium text-slate-700"
                                             >
                                               {user}
                                             </button>
                                           ))
                                         }
                                       </div>
                                     </div>
                                   </div>
                                   
                                   <div className="space-y-2">
                                     {esc.stakeholders.length === 0 && <p className="text-xs text-slate-400 italic">No stakeholders added.</p>}
                                     {esc.stakeholders.map(person => (
                                       <div key={person.name} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-3 ${person.isDecisionMaker ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                         <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${person.isDecisionMaker ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                                             {person.name.charAt(0)}
                                           </div>
                                           <div>
                                             <span className={`text-sm font-bold block ${person.isDecisionMaker ? 'text-amber-900' : 'text-slate-700'}`}>{person.name}</span>
                                             {person.isDecisionMaker && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Decision Maker</span>}
                                           </div>
                                         </div>
                                         <div className="flex items-center justify-end gap-2">
                                           <button 
                                             onClick={() => setDecisionMaker(esc.id, person.name)}
                                             className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${person.isDecisionMaker ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600 hover:bg-amber-100'}`}
                                           >
                                             <Crown className="w-3 h-3" /> {person.isDecisionMaker ? 'Owner' : 'Make Owner'}
                                           </button>
                                           <button 
                                             onClick={() => removeStakeholder(esc.id, person.name)}
                                             className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                           >
                                             <X className="w-4 h-4" />
                                           </button>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                             </div>
                             ))}
                         </div>
                         </div>
                    )}

                    {/* RESOLUTIONS TAB */}
                    {activeTab === 'resolutions' && (
                         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                         <Card title="Propose New Resolution" icon={Plus}>
                             <form onSubmit={addResolution} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="col-span-1 md:col-span-2">
                                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Proposed Solution</label>
                                 <input name="solution" required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Briefly describe the fix..." />
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-green-600 mb-1.5">Pros</label>
                                 <textarea name="pros" required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none" />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-red-600 mb-1.5">Cons</label>
                                 <textarea name="cons" required className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none" />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-600 mb-1.5">Effort</label>
                                 <div className="space-y-3">
                                 <PrettySelect name="effort" options={EFFORT_LEVELS} icon={Clock} />
                                 <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100">
                                     Add Proposal
                                 </button>
                                 </div>
                             </div>
                             </form>
                         </Card>
 
                         <div className="grid grid-cols-1 gap-6">
                             {editingIssue.resolutions.map(res => (
                             <div key={res.id} className={`border-2 rounded-xl overflow-hidden transition-all ${res.isAgreed ? 'border-green-500 bg-green-50/20' : 'border-slate-200 bg-white'}`}>
                                 <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start bg-white gap-4">
                                 <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-lg ${res.isAgreed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                     <ThumbsUp className="w-5 h-5" />
                                     </div>
                                     <div>
                                     <h4 className="font-bold text-slate-800 text-lg">{res.solution}</h4>
                                     </div>
                                 </div>
                                 <button 
                                     onClick={() => toggleAgreement(res.id)}
                                     className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                     res.isAgreed 
                                         ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700' 
                                         : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                                     }`}
                                 >
                                     {res.isAgreed ? <><CheckCircle2 className="w-4 h-4" /> AGREED</> : 'Mark as Agreed'}
                                 </button>
                                 </div>
                                 
                                 <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                 <div className="space-y-1">
                                     <h5 className="font-bold text-green-700 uppercase text-[10px] tracking-wide">Pros</h5>
                                     <p className="text-slate-700">{res.pros}</p>
                                 </div>
                                 <div className="space-y-1">
                                     <h5 className="font-bold text-red-700 uppercase text-[10px] tracking-wide">Cons</h5>
                                     <p className="text-slate-700">{res.cons}</p>
                                 </div>
                                 <div className="space-y-4">
                                     <div className="space-y-1">
                                         <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-wide">Effort</h5>
                                         <span className="inline-block px-2 py-1 bg-slate-200 rounded text-slate-700 font-bold text-xs">{res.effort}</span>
                                     </div>
                                 </div>
                                 </div>
                             </div>
                             ))}
                         </div>
                         </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card title="Audit Trail" icon={History}>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2 my-4">
                            {editingIssue.auditLog.slice().reverse().map(log => (
                                <div key={log.id} className="relative pl-8 group">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-300 group-hover:border-indigo-600 transition-colors"></div>
                                <p className="text-slate-800 font-medium text-sm">{log.action}</p>
                                <span className="text-xs text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                            ))}
                            </div>
                        </Card>
                        </div>
                    )}

                </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}