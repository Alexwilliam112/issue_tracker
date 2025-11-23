"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  BarChart3,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react";

// --- Constants & Mock Data ---

const STATUS_FLOW = ["Open", "In Process", "Resolved"];
const ISSUE_STAGES = [
  "Triage",
  "Investigation",
  "Implementation",
  "Verification",
  "Deployment",
  "Monitoring",
];
const ENVIRONMENTS = [
  "Development",
  "Staging",
  "Production",
  "Disaster Recovery",
  "N/A",
];
const PROJECTS = [
  "Alpha API",
  "Beta Frontend",
  "Gamma DB",
  "Delta Auth",
  "Epsilon Mobile",
  "Zeta Analytics",
  "Omega Core",
];
const ISSUE_TYPES = [
  "Bug",
  "Incident",
  "Change Request",
  "Vulnerability",
  "Feature Request",
  "Tech Debt",
];
const ROOT_CAUSE_CATS = [
  "Code Error",
  "Configuration",
  "Infrastructure",
  "Third Party",
  "Human Error",
  "Capacity",
  "Design Flaw",
  "Data Quality",
];
const RISK_OPTIONS = [
  "Data Loss",
  "Security Breach",
  "Compliance Violation",
  "Financial Impact",
  "Reputation Damage",
  "SLA Breach",
];
const MOCK_USERS = [
  "Alice Engineer",
  "Bob Manager",
  "Charlie Director",
  "Diana VP",
  "Evan CTO",
  "Frank External",
  "Grace Support",
  "Heidi Ops",
  "Ivan Security",
  "Judy QA",
];

const INITIAL_DATA = [
  {
    id: "1",
    title: "Production Latency Spike in API Gateway",
    status: "In Process",
    stage: "Investigation",
    created: new Date(Date.now() - 86400000 * 2).toISOString(),

    // New Fields
    reportedBy: "Alice Engineer",
    reportedAt: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 16),
    environment: "Production",
    project: "Alpha API",
    issueType: "Incident",
    assignee: "Bob Manager",

    // Context
    context: "Observed during peak load on Monday.",
    problemStatement: "API response times increased by 400% causing timeouts.",
    evidence: "Grafana dashboards screenshot attached (mock).",

    // Risks
    risks: ["SLA Breach", "Reputation Damage"],
    riskScore: 15, // Calculated (e.g. 5 points for SLA, 10 for Reputation)

    // Analysis
    rootCauseCategory: "Capacity",
    rootCause: "Insufficient connection pool settings for peak traffic.",

    // Resolution
    closedAt: "",

    escalations: [
      {
        id: 101,
        layer: 1,
        stakeholders: [
          { name: "Bob Manager", isDecisionMaker: true },
          { name: "Alice Engineer", isDecisionMaker: false },
        ],
        status: "Done",
      },
    ],
    resolutions: [
      {
        id: 201,
        solution: "Scale up AWS instances vertically",
        pros: "Quick to implement",
        cons: "High cost increase",
        concerns: "Might hit quotas",
        effort: 4, // Man-hours
        isAgreed: false,
      },
    ],
    comments: [
      {
        id: 301,
        user: "Alice Engineer",
        text: "I checked the logs, looks like database locking.",
        timestamp: new Date().toISOString(),
      },
    ],
    auditLog: [
      {
        id: 401,
        action: "Issue Created",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 402,
        action: "Status changed to In Process",
        timestamp: new Date(Date.now() - 40000000).toISOString(),
      },
    ],
  },
];

// --- Helper Components ---

const StatusBadge = ({ status }) => {
  const colors = {
    Open: "bg-blue-100 text-blue-800 border-blue-200",
    "In Process": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Resolved: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
        colors[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
};

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
  >
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
      <h3 className="font-semibold text-slate-700 truncate text-sm uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const PrettySelect = ({
  value,
  onChange,
  options,
  icon: Icon,
  className = "",
  name,
  label,
}) => (
  <div className={`relative ${className}`}>
    {label && (
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </label>
    )}
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
            ${Icon ? "pl-9" : "pl-3"} pr-8 py-2 
            transition-all hover:border-indigo-300 cursor-pointer shadow-sm font-medium truncate
        `}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

const AutoTextArea = ({
  value,
  onChange,
  className,
  placeholder,
  minRows = 1,
}) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
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

// --- Multi-Select Filter Component (Searchable) ---

const MultiSelectFilter = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "Filter...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
      });
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative inline-block w-full md:w-auto">
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <button
        onClick={toggleOpen}
        className={`
                    w-full md:w-48 bg-white border text-sm rounded-lg px-3 py-2 text-left flex items-center justify-between
                    ${
                      selected.length > 0
                        ? "border-indigo-300 text-indigo-600 bg-indigo-50"
                        : "border-slate-300 text-slate-600"
                    }
                `}
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: 240,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-3">
                  No matches found
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                  >
                    {selected.includes(opt) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{opt}</span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

// --- Searchable Single Select (Portal Based) ---

const SearchableSingleSelect = ({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  icon: Icon,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={toggleOpen}
        className={`
                    w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg 
                    hover:border-indigo-300 cursor-pointer shadow-sm font-medium truncate flex items-center justify-between
                    ${Icon ? "pl-3" : "px-3"} py-2
                `}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className={!value ? "text-slate-400 font-normal" : ""}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2">
                  No results
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between group
                                        ${
                                          value === opt
                                            ? "bg-indigo-50 text-indigo-700 font-bold"
                                            : "text-slate-700 hover:bg-slate-50"
                                        }
                                    `}
                  >
                    <span>{opt}</span>
                    {value === opt && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

// --- Searchable User Select ---
const UserSearchSelect = ({ availableUsers, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: Math.max(0, rect.right - 240),
      });
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const filtered = availableUsers.filter((u) =>
    u.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (user) => {
    onAdd(user);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Add Person
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: 240,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2">
                  No users found
                </div>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user}
                    onClick={() => handleAdd(user)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 rounded text-slate-700 flex items-center justify-between group"
                  >
                    <span>{user}</span>
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// --- Risk Multi-Select Component (Updated with Search) ---

const RisksInput = ({ selectedRisks = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const available = RISK_OPTIONS.filter(
    (r) =>
      !selectedRisks.includes(r) &&
      r.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addRisk = (risk) => {
    onChange([...selectedRisks, risk]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const removeRisk = (risk) => {
    onChange(selectedRisks.filter((r) => r !== risk));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
        Risks Identified
      </label>
      <div
        className="min-h-[38px] w-full bg-white border border-slate-300 rounded-lg px-2 py-1 flex flex-wrap items-center gap-1.5 cursor-pointer hover:border-indigo-300 transition-colors"
        onClick={toggleOpen}
      >
        {selectedRisks.length === 0 && (
          <span className="text-sm text-slate-400 p-1">No risks selected</span>
        )}
        {selectedRisks.map((risk) => (
          <span
            key={risk}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-100"
          >
            {risk}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRisk(risk);
              }}
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

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search risks..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {available.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2">
                  No remaining risks found
                </div>
              ) : (
                available.map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => addRisk(risk)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between group text-slate-700 transition-colors"
                  >
                    {risk}
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

// --- Modal Component ---

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full md:h-[95vh] md:rounded-2xl md:max-w-6xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-none">
        <div className="px-4 md:px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex-1 pr-4 overflow-hidden">{title}</div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
  const [issues, setIssues] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingIssue, setEditingIssue] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const defaultFilters = {
    project: [],
    environment: [],
    issueType: [],
    status: [],
    stage: [],
    rootCause: [],
    risks: [],
    assignees: [],
    startDate: "",
    endDate: "",
    resolvedStartDate: "",
    resolvedEndDate: "",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterInputs, setFilterInputs] = useState(defaultFilters); // Pending state
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters); // Applied state
  const [pagination, setPagination] = useState({ page: 1, limit: 100 });

  // Hydration fix & Load data
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("issueTrackerData");
    if (saved) {
      try {
        setIssues(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    if (isMounted && issues.length > 0) {
      localStorage.setItem("issueTrackerData", JSON.stringify(issues));
    }
  }, [issues, isMounted]);

  // Prevent rendering until client-side hydration is complete to match localStorage
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Filter Logic ---
  const filteredIssues = issues.filter((i) => {
    // 1. Text Search (Live)
    const searchMatch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.includes(searchTerm) ||
      i.project?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Multi-Selects (Applied)
    const projectMatch =
      appliedFilters.project.length === 0 ||
      appliedFilters.project.includes(i.project);
    const envMatch =
      appliedFilters.environment.length === 0 ||
      appliedFilters.environment.includes(i.environment);
    const typeMatch =
      appliedFilters.issueType.length === 0 ||
      appliedFilters.issueType.includes(i.issueType);
    const statusMatch =
      appliedFilters.status.length === 0 ||
      appliedFilters.status.includes(i.status);
    const stageMatch =
      appliedFilters.stage.length === 0 ||
      appliedFilters.stage.includes(i.stage);
    const rootMatch =
      appliedFilters.rootCause.length === 0 ||
      appliedFilters.rootCause.includes(i.rootCauseCategory);

    // New filters
    const riskMatch =
      appliedFilters.risks.length === 0 ||
      (i.risks && i.risks.some((r) => appliedFilters.risks.includes(r)));
    const assigneeMatch =
      appliedFilters.assignees.length === 0 ||
      appliedFilters.assignees.includes(i.assignee);

    // 3. Date Range (Applied)
    let dateMatch = true;
    if (appliedFilters.startDate) {
      dateMatch =
        dateMatch &&
        new Date(i.reportedAt) >= new Date(appliedFilters.startDate);
    }
    if (appliedFilters.endDate) {
      dateMatch =
        dateMatch && new Date(i.reportedAt) <= new Date(appliedFilters.endDate);
    }

    // Resolved Date Range
    let resolvedDateMatch = true;
    if (appliedFilters.resolvedStartDate) {
      resolvedDateMatch =
        resolvedDateMatch &&
        i.closedAt &&
        new Date(i.closedAt) >= new Date(appliedFilters.resolvedStartDate);
    }
    if (appliedFilters.resolvedEndDate) {
      resolvedDateMatch =
        resolvedDateMatch &&
        i.closedAt &&
        new Date(i.closedAt) <= new Date(appliedFilters.resolvedEndDate);
    }

    return (
      searchMatch &&
      projectMatch &&
      envMatch &&
      typeMatch &&
      statusMatch &&
      stageMatch &&
      rootMatch &&
      riskMatch &&
      assigneeMatch &&
      dateMatch &&
      resolvedDateMatch
    );
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredIssues.length / pagination.limit);
  const paginatedIssues = filteredIssues.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const updateFilterInput = (key, value) => {
    setFilterInputs((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filterInputs);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilterInputs(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination({ page: 1, limit: parseInt(newLimit) });
  };

  const handleStatusClick = (status) => {
    const newStatusFilter = [status];
    setFilterInputs((prev) => ({ ...prev, status: newStatusFilter }));
    setAppliedFilters((prev) => ({ ...prev, status: newStatusFilter }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // --- Status Summary Counts ---
  const getStatusCounts = () => {
    const counts = { Open: 0, "In Process": 0, Resolved: 0 };
    filteredIssues.forEach((i) => {
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
      "ID",
      "Title",
      "Status",
      "Stage",
      "Project",
      "Environment",
      "Issue Type",
      "Reported By",
      "Reported At",
      "Risk Score",
      "Risks",
      "Assignee",
      "Context",
      "Problem Statement",
      "Evidence",
      "Root Cause Category",
      "Root Cause Detail",
      "Latest Escalation Layer",
      "Latest Escalation Status",
      "Agreed Resolution (Solution)",
      "Agreed Resolution (Effort)",
      "Closed At",
    ];

    // Map data to rows
    const rows = filteredIssues.map((issue) => {
      const latestEscalation =
        issue.escalations.length > 0
          ? issue.escalations[issue.escalations.length - 1]
          : null;
      const agreedResolution = issue.resolutions.find((r) => r.isAgreed);

      return [
        issue.id,
        `"${(issue.title || "").replace(/"/g, '""')}"`,
        issue.status,
        issue.stage || "",
        issue.project,
        issue.environment,
        issue.issueType,
        issue.reportedBy,
        new Date(issue.reportedAt).toLocaleString(),
        issue.riskScore,
        `"${(issue.risks || []).join(", ")}"`,
        issue.assignee,
        `"${(issue.context || "").replace(/"/g, '""')}"`,
        `"${(issue.problemStatement || "").replace(/"/g, '""')}"`,
        `"${(issue.evidence || "").replace(/"/g, '""')}"`,
        issue.rootCauseCategory,
        `"${(issue.rootCause || "").replace(/"/g, '""')}"`,
        latestEscalation ? latestEscalation.layer : "N/A",
        latestEscalation ? latestEscalation.status : "N/A",
        agreedResolution
          ? `"${agreedResolution.solution.replace(/"/g, '""')}"`
          : "N/A",
        agreedResolution ? agreedResolution.effort : "0",
        issue.closedAt ? new Date(issue.closedAt).toLocaleString() : "",
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `IssueTracker_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Actions ---

  const validateIssue = (issue) => {
    const required = [
      "title",
      "project",
      "environment",
      "issueType",
      "reportedBy",
      "reportedAt",
      "context",
      "problemStatement",
    ];
    const missing = required.filter((field) => !issue[field]);
    return missing;
  };

  const handleSave = () => {
    if (!editingIssue) return;

    const missingFields = validateIssue(editingIssue);
    if (missingFields.length > 0) {
      alert(`Please fill in all mandatory fields: ${missingFields.join(", ")}`);
      return;
    }

    if (isCreating) {
      const newId = Date.now().toString();
      const finalIssue = {
        ...editingIssue,
        id: newId,
        created: new Date().toISOString(),
        auditLog: editingIssue.auditLog.map((log) => ({
          ...log,
          timestamp: new Date().toISOString(),
        })),
      };
      setIssues([finalIssue, ...issues]);
    } else {
      setIssues((prev) =>
        prev.map((i) => (i.id === editingIssue.id ? editingIssue : i))
      );
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!editingIssue) return;
    if (
      confirm(
        "Are you sure you want to delete this issue? This action cannot be undone."
      )
    ) {
      setIssues((prev) => prev.filter((i) => i.id !== editingIssue.id));
      closeModal();
    }
  };

  const deleteEscalationLayer = (layerId) => {
    if (!confirm("Delete this escalation layer?")) return;
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.filter((e) => e.id !== layerId),
      };
    });
  };

  const deleteResolution = (resId) => {
    if (!confirm("Delete this resolution proposal?")) return;
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        resolutions: prev.resolutions.filter((r) => r.id !== resId),
      };
    });
  };

  // --- Edit Actions (Applied to `editingIssue`) ---

  const updateDraftField = (field, value) => {
    setEditingIssue((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateRisks = (newRisks) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      const score = newRisks.length * 10;
      return { ...prev, risks: newRisks, riskScore: score };
    });
  };

  const addDraftAuditLog = (action) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        auditLog: [
          ...prev.auditLog,
          { id: Date.now(), action, timestamp: new Date().toISOString() },
        ],
      };
    });
  };

  const updateStatus = (newStatus) => {
    updateDraftField("status", newStatus);
    addDraftAuditLog(`Status changed to ${newStatus}`);
  };

  const updateStage = (newStage) => {
    updateDraftField("stage", newStage);
    addDraftAuditLog(`Stage changed to ${newStage}`);
  };

  const openCreateModal = () => {
    const blankIssue = {
      id: "new",
      title: "",
      status: "Open",
      stage: "Triage",
      created: new Date().toISOString(),
      // New Field Defaults
      reportedBy: "",
      reportedAt: new Date().toISOString().slice(0, 16), // format for datetime-local
      environment: "Development",
      project: "",
      issueType: "Bug",
      rootCauseCategory: "",
      rootCause: "",
      assignee: "",
      closedAt: "",
      risks: [],
      riskScore: 0,
      // Standard Fields
      context: "",
      problemStatement: "",
      evidence: "",
      escalations: [],
      resolutions: [],
      comments: [],
      auditLog: [
        {
          id: Date.now(),
          action: "Draft Started",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setEditingIssue(blankIssue);
    setIsCreating(true);
    setActiveTab("overview");
  };

  const openViewModal = (id) => {
    const issueToEdit = issues.find((i) => i.id === id);
    if (issueToEdit) {
      setEditingIssue(JSON.parse(JSON.stringify(issueToEdit)));
      setIsCreating(false);
      setActiveTab("overview");
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
    const newLayer = {
      id: Date.now(),
      layer: layerNum,
      stakeholders: [],
      status: "Pending",
    };
    setEditingIssue((prev) =>
      prev ? { ...prev, escalations: [...prev.escalations, newLayer] } : null
    );
  };

  const updateEscalationStatus = (layerId, newStatus) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.map((e) =>
          e.id === layerId ? { ...e, status: newStatus } : e
        ),
      };
    });
  };

  const addStakeholder = (layerId, userName) => {
    if (!userName) return;
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.map((layer) => {
          if (layer.id !== layerId) return layer;
          if (layer.stakeholders.some((s) => s.name === userName)) return layer;
          const isFirst = layer.stakeholders.length === 0;
          return {
            ...layer,
            stakeholders: [
              ...layer.stakeholders,
              { name: userName, isDecisionMaker: isFirst },
            ],
          };
        }),
      };
    });
  };

  const removeStakeholder = (layerId, userName) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.map((layer) => {
          if (layer.id !== layerId) return layer;
          return {
            ...layer,
            stakeholders: layer.stakeholders.filter((s) => s.name !== userName),
          };
        }),
      };
    });
  };

  const setDecisionMaker = (layerId, userName) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.map((layer) => {
          if (layer.id !== layerId) return layer;
          return {
            ...layer,
            stakeholders: layer.stakeholders.map((s) => ({
              ...s,
              isDecisionMaker: s.name === userName,
            })),
          };
        }),
      };
    });
  };

  const addResolution = (e) => {
    e.preventDefault();
    if (!editingIssue) return;
    const formData = new FormData(e.target);
    const newRes = {
      id: Date.now(),
      solution: formData.get("solution"),
      pros: formData.get("pros"),
      cons: formData.get("cons"),
      concerns: formData.get("concerns"),
      effort: parseInt(formData.get("effort") || 0, 10),
      isAgreed: false,
    };
    setEditingIssue((prev) =>
      prev ? { ...prev, resolutions: [...prev.resolutions, newRes] } : null
    );
    e.target.reset();
  };

  const updateResolution = (resId, field, value) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        resolutions: prev.resolutions.map((r) =>
          r.id === resId ? { ...r, [field]: value } : r
        ),
      };
    });
  };

  const toggleAgreement = (resId) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        resolutions: prev.resolutions.map((r) => ({
          ...r,
          isAgreed: r.id === resId ? !r.isAgreed : false,
        })),
      };
    });
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!editingIssue) return;
    const text = e.target.comment.value;
    if (!text) return;
    setEditingIssue((prev) =>
      prev
        ? {
            ...prev,
            comments: [
              ...prev.comments,
              {
                id: Date.now(),
                user: "Current User",
                text,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : null
    );
    e.target.reset();
  };

  const visibleTabs = ["overview", "escalations", "resolutions"];
  if (!isCreating) visibleTabs.push("history");

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-2 md:p-4">
      {/* Dashboard Header */}
      <div className="max-w-[98%] mx-auto mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            IssueTracker
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Manage critical incidents, escalations, and resolutions.
          </p>
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
      <div className="max-w-[98%] mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STATUS_FLOW.map((status) => {
            let borderClass = "border-slate-200";
            let bgClass = "bg-white";
            let textClass = "text-slate-700";

            if (status === "Open") {
              borderClass = "border-blue-200";
              bgClass = "bg-blue-50/50";
              textClass = "text-blue-700";
            }
            if (status === "In Process") {
              borderClass = "border-yellow-200";
              bgClass = "bg-yellow-50/50";
              textClass = "text-yellow-700";
            }
            if (status === "Resolved") {
              borderClass = "border-green-200";
              bgClass = "bg-green-50/50";
              textClass = "text-green-700";
            }

            const isSelected =
              appliedFilters.status.includes(status) &&
              appliedFilters.status.length === 1;

            return (
              <div
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between h-24
                            ${borderClass} ${bgClass} 
                            ${
                              isSelected
                                ? "ring-2 ring-offset-2 ring-indigo-500"
                                : ""
                            }
                        `}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${textClass}`}
                >
                  {status}
                </span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-slate-800">
                    {statusCounts[status]}
                  </span>
                  <Activity className={`w-5 h-5 opacity-20 ${textClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Table Container */}
      <div className="max-w-[98%] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible z-0 relative">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                placeholder="Search by title, ID, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                showFilters
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-300 text-slate-600"
              }`}
            >
              <Filter className="w-4 h-4" /> Filters
              {appliedFilters.project.length +
                appliedFilters.environment.length +
                appliedFilters.issueType.length +
                appliedFilters.status.length +
                appliedFilters.stage.length +
                appliedFilters.rootCause.length +
                appliedFilters.risks.length +
                appliedFilters.assignees.length +
                (appliedFilters.startDate ? 1 : 0) +
                (appliedFilters.resolvedStartDate ? 1 : 0) >
                0 && (
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {appliedFilters.project.length +
                    appliedFilters.environment.length +
                    appliedFilters.issueType.length +
                    appliedFilters.status.length +
                    appliedFilters.stage.length +
                    appliedFilters.rootCause.length +
                    appliedFilters.risks.length +
                    appliedFilters.assignees.length +
                    (appliedFilters.startDate ? 1 : 0) +
                    (appliedFilters.resolvedStartDate ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MultiSelectFilter
                  label="Project"
                  options={PROJECTS}
                  selected={filterInputs.project}
                  onChange={(v) => updateFilterInput("project", v)}
                />
                <MultiSelectFilter
                  label="Environment"
                  options={ENVIRONMENTS}
                  selected={filterInputs.environment}
                  onChange={(v) => updateFilterInput("environment", v)}
                />
                <MultiSelectFilter
                  label="Issue Type"
                  options={ISSUE_TYPES}
                  selected={filterInputs.issueType}
                  onChange={(v) => updateFilterInput("issueType", v)}
                />
                <MultiSelectFilter
                  label="Status"
                  options={STATUS_FLOW}
                  selected={filterInputs.status}
                  onChange={(v) => updateFilterInput("status", v)}
                />
                <MultiSelectFilter
                  label="Stage"
                  options={ISSUE_STAGES}
                  selected={filterInputs.stage}
                  onChange={(v) => updateFilterInput("stage", v)}
                />
                <MultiSelectFilter
                  label="Root Cause"
                  options={ROOT_CAUSE_CATS}
                  selected={filterInputs.rootCause}
                  onChange={(v) => updateFilterInput("rootCause", v)}
                />
                <MultiSelectFilter
                  label="Risks"
                  options={RISK_OPTIONS}
                  selected={filterInputs.risks}
                  onChange={(v) => updateFilterInput("risks", v)}
                />
                <MultiSelectFilter
                  label="Assignee"
                  options={MOCK_USERS}
                  selected={filterInputs.assignees}
                  onChange={(v) => updateFilterInput("assignees", v)}
                />

                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Reported Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filterInputs.startDate}
                      onChange={(e) =>
                        updateFilterInput("startDate", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={filterInputs.endDate}
                      onChange={(e) =>
                        updateFilterInput("endDate", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Resolved Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filterInputs.resolvedStartDate}
                      onChange={(e) =>
                        updateFilterInput("resolvedStartDate", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={filterInputs.resolvedEndDate}
                      onChange={(e) =>
                        updateFilterInput("resolvedEndDate", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-bold border border-slate-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-6 py-4 w-20">ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 w-32">Reported</th>
                <th className="px-6 py-4 w-32">By</th>
                <th className="px-6 py-4 w-32">Project</th>
                <th className="px-6 py-4 w-32">Env</th>
                <th className="px-6 py-4 w-24">Risk</th>
                <th className="px-6 py-4 w-32">Type</th>
                <th className="px-6 py-4 w-32">Status</th>
                <th className="px-6 py-4 w-32">Stage</th>
                <th className="px-6 py-4 w-32">Root Cause</th>
                <th className="px-6 py-4 w-32">Resolved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedIssues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => openViewModal(issue.id)}
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    #{issue.id.slice(-4)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block w-48 truncate">
                      {issue.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {new Date(issue.reportedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {issue.reportedBy}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {issue.project}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {issue.environment}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        issue.riskScore > 30
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {issue.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                      {issue.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-indigo-600">
                    {issue.stage}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {issue.rootCauseCategory || "-"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {issue.closedAt
                      ? new Date(issue.closedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {paginatedIssues.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-6 py-8 text-center text-slate-400 text-sm italic"
                  >
                    No issues found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => openViewModal(issue.id)}
              className="p-4 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={issue.status} />
                <span className="text-xs text-slate-400 font-mono">
                  #{issue.id.slice(-4)}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                {issue.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                  {issue.project}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                  {issue.issueType}
                </span>
                {issue.stage && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
                    {issue.stage}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs text-slate-500">
                  {new Date(issue.reportedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {paginatedIssues.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              No issues found matching criteria.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="px-4 md:px-6 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {[
                100, 200, 300, 400, 500, 600, 1000, 1500, 2000, 2500, 3000,
                3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000,
              ].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <span className="ml-2">
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(
                pagination.page * pagination.limit,
                filteredIssues.length
              )}{" "}
              of {filteredIssues.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-700">
              Page {pagination.page} of {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* UNIFIED MODAL */}
      <Modal
        isOpen={!!editingIssue}
        onClose={closeModal}
        footer={
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            <div className="flex w-full md:w-auto">
              {!isCreating && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Delete Issue
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={closeModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />{" "}
                {isCreating ? "Cancel" : "Discard"}
              </button>
              <button
                onClick={handleSave}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all"
              >
                <Save className="w-4 h-4" />{" "}
                {isCreating ? "Create Issue" : "Save Changes"}
              </button>
            </div>
          </div>
        }
        title={
          editingIssue && (
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {!isCreating && (
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-500">
                      #{editingIssue.id.slice(-4)}
                    </span>
                  )}
                  <div className="md:hidden">
                    <StatusBadge status={editingIssue.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={editingIssue.title}
                  onChange={(e) => updateDraftField("title", e.target.value)}
                  placeholder="Enter Issue Title... *"
                  className="font-bold text-lg md:text-xl text-slate-800 bg-transparent border-none focus:ring-0 focus:border-b focus:border-indigo-500 rounded-none px-0 w-full transition-colors placeholder-slate-300"
                />
                {!editingIssue.title && <span className="text-red-500">*</span>}
              </div>
            </div>
          )
        }
      >
        {editingIssue && (
          <div className="flex flex-col h-full bg-slate-50/30">
            {/* Scrollable Tabs Header */}
            <div className="flex w-full border-b border-slate-200 bg-white shrink-0 overflow-x-auto no-scrollbar px-4 md:px-6 shadow-sm">
              <div className="flex flex-nowrap min-w-full">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 mr-6 md:mr-8 text-sm font-bold border-b-[3px] transition-colors capitalize whitespace-nowrap shrink-0 ${
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab === "history" ? "Audit Trail" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Left Column: Core Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card title="Issue Details" icon={Briefcase}>
                          <div className="space-y-3">
                            <SearchableSingleSelect
                              required
                              label="Project"
                              options={PROJECTS}
                              value={editingIssue.project}
                              onChange={(v) => updateDraftField("project", v)}
                            />
                            <SearchableSingleSelect
                              required
                              label="Environment"
                              options={ENVIRONMENTS}
                              value={editingIssue.environment}
                              onChange={(v) =>
                                updateDraftField("environment", v)
                              }
                            />
                            <SearchableSingleSelect
                              required
                              label="Issue Type"
                              options={ISSUE_TYPES}
                              value={editingIssue.issueType}
                              onChange={(v) => updateDraftField("issueType", v)}
                            />
                          </div>
                        </Card>
                        <Card title="Reporting" icon={User}>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Reported By{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                value={editingIssue.reportedBy}
                                onChange={(e) =>
                                  updateDraftField("reportedBy", e.target.value)
                                }
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Name..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Reported At{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="datetime-local"
                                value={editingIssue.reportedAt}
                                onChange={(e) =>
                                  updateDraftField("reportedAt", e.target.value)
                                }
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <SearchableSingleSelect
                              label="Current Assignee"
                              options={MOCK_USERS}
                              value={editingIssue.assignee}
                              onChange={(v) => updateDraftField("assignee", v)}
                            />
                          </div>
                        </Card>
                      </div>

                      <Card title="Description" icon={FileText}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                              Context <span className="text-red-500">*</span>
                            </label>
                            <AutoTextArea
                              value={editingIssue.context}
                              onChange={(e) =>
                                updateDraftField("context", e.target.value)
                              }
                              placeholder="What is happening?"
                              className="text-slate-700"
                              minRows={2}
                            />
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <label className="block text-xs font-bold text-red-800 uppercase tracking-wide mb-1">
                              Problem Statement{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <AutoTextArea
                              value={editingIssue.problemStatement}
                              onChange={(e) =>
                                updateDraftField(
                                  "problemStatement",
                                  e.target.value
                                )
                              }
                              placeholder="Define the core problem..."
                              className="text-red-900 font-medium"
                              minRows={2}
                            />
                          </div>
                        </div>
                      </Card>

                      <Card title="Analysis & Evidence" icon={Activity}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                              Evidence / Logs
                            </label>
                            <AutoTextArea
                              value={editingIssue.evidence}
                              onChange={(e) =>
                                updateDraftField("evidence", e.target.value)
                              }
                              placeholder="Paste logs here..."
                              className="font-mono text-xs bg-slate-50 border-slate-200 rounded-lg min-h-[100px]"
                              minRows={4}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SearchableSingleSelect
                              label="Root Cause Category"
                              options={ROOT_CAUSE_CATS}
                              value={editingIssue.rootCauseCategory}
                              onChange={(v) =>
                                updateDraftField("rootCauseCategory", v)
                              }
                            />
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Root Cause Detail
                              </label>
                              <AutoTextArea
                                value={editingIssue.rootCause}
                                onChange={(e) =>
                                  updateDraftField("rootCause", e.target.value)
                                }
                                placeholder="Explain why..."
                                className="text-slate-700"
                                minRows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Comments - Hidden on Create */}
                      {!isCreating && (
                        <Card title="Discussion" icon={MessageSquare}>
                          <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                            {editingIssue.comments.length === 0 && (
                              <p className="text-slate-400 italic text-sm">
                                No comments yet.
                              </p>
                            )}
                            {editingIssue.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-slate-50 p-3 rounded-lg text-sm"
                              >
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span className="font-bold text-slate-700">
                                    {comment.user}
                                  </span>
                                  <span>
                                    {new Date(
                                      comment.timestamp
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <p>{comment.text}</p>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={addComment} className="flex gap-2">
                            <input
                              name="comment"
                              placeholder="Add comment..."
                              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                            <button
                              type="submit"
                              className="bg-slate-800 text-white px-4 py-2 rounded text-sm"
                            >
                              Post
                            </button>
                          </form>
                        </Card>
                      )}
                    </div>

                    {/* Right Column: Meta, Risk, Resolution */}
                    <div className="space-y-6">
                      <Card title="Status & Stage" icon={Activity}>
                        <div className="space-y-4">
                          <PrettySelect
                            label="Current Status"
                            name="status"
                            options={STATUS_FLOW}
                            value={editingIssue.status}
                            onChange={(e) => updateStatus(e.target.value)}
                          />
                          <SearchableSingleSelect
                            label="Issue Stage"
                            options={ISSUE_STAGES}
                            value={editingIssue.stage}
                            onChange={(v) => updateStage(v)}
                          />
                        </div>
                      </Card>

                      <Card title="Risk Assessment" icon={ShieldAlert}>
                        <div className="space-y-4">
                          <RisksInput
                            selectedRisks={editingIssue.risks || []}
                            onChange={updateRisks}
                          />
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                              Risk Score (Calculated)
                            </label>
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-700 flex justify-between items-center">
                              <span>{editingIssue.riskScore || 0}</span>
                              <span className="text-xs font-normal text-slate-400">
                                View Only
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card title="Final Resolution" icon={CheckCircle2}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                              Closed At
                            </label>
                            <input
                              type="datetime-local"
                              value={editingIssue.closedAt}
                              onChange={(e) =>
                                updateDraftField("closedAt", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* ... other tabs (escalations, resolutions, history) remain same, just rendering them below ... */}

                {/* ESCALATIONS TAB */}
                {activeTab === "escalations" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          Escalation Matrix
                        </h3>
                        <p className="text-sm text-slate-500">
                          Manage support tiers.
                        </p>
                      </div>
                      <button
                        onClick={addEscalationLayer}
                        disabled={
                          editingIssue.escalations.length > 0 &&
                          editingIssue.escalations[
                            editingIssue.escalations.length - 1
                          ].status !== "Done"
                        }
                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          editingIssue.escalations.length === 0 ||
                          editingIssue.escalations[
                            editingIssue.escalations.length - 1
                          ].status === "Done"
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4" /> Escalate to Next
                        Layer
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
                        <div
                          key={esc.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm relative overflow-hidden group/card"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b border-slate-100 gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0 ${
                                  esc.status === "Done"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-indigo-100 text-indigo-600"
                                }`}
                              >
                                {esc.layer}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">
                                  Level {esc.layer} Escalation
                                </h4>
                                <div className="flex bg-slate-100 rounded-lg p-0.5 mt-1 w-fit">
                                  <button
                                    onClick={() =>
                                      updateEscalationStatus(esc.id, "Pending")
                                    }
                                    className={`px-3 py-0.5 text-[10px] rounded uppercase tracking-wide font-bold transition-all ${
                                      esc.status === "Pending"
                                        ? "bg-white shadow text-slate-800"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateEscalationStatus(esc.id, "Done")
                                    }
                                    className={`px-3 py-0.5 text-[10px] rounded uppercase tracking-wide font-bold transition-all ${
                                      esc.status === "Done"
                                        ? "bg-green-500 shadow text-white"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteEscalationLayer(esc.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover/card:opacity-100"
                              title="Delete Escalation Layer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Stakeholders
                              </label>
                              <div className="relative group">
                                <UserSearchSelect
                                  availableUsers={MOCK_USERS.filter(
                                    (u) =>
                                      !esc.stakeholders.some(
                                        (s) => s.name === u
                                      )
                                  )}
                                  onAdd={(user) => addStakeholder(esc.id, user)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              {esc.stakeholders.length === 0 && (
                                <p className="text-xs text-slate-400 italic">
                                  No stakeholders added.
                                </p>
                              )}
                              {esc.stakeholders.map((person) => (
                                <div
                                  key={person.name}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-3 ${
                                    person.isDecisionMaker
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-slate-50 border-slate-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        person.isDecisionMaker
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {person.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span
                                        className={`text-sm font-bold block ${
                                          person.isDecisionMaker
                                            ? "text-amber-900"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {person.name}
                                      </span>
                                      {person.isDecisionMaker && (
                                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                                          Decision Maker
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() =>
                                        setDecisionMaker(esc.id, person.name)
                                      }
                                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                        person.isDecisionMaker
                                          ? "bg-amber-200 text-amber-800"
                                          : "bg-slate-200 text-slate-600 hover:bg-amber-100"
                                      }`}
                                    >
                                      <Crown className="w-3 h-3" />{" "}
                                      {person.isDecisionMaker
                                        ? "Owner"
                                        : "Make Owner"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        removeStakeholder(esc.id, person.name)
                                      }
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
                {activeTab === "resolutions" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                    <Card title="Propose New Resolution" icon={Plus}>
                      <form
                        onSubmit={addResolution}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Proposed Solution
                          </label>
                          <textarea
                            name="solution"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                            placeholder="Describe the fix..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-green-600 mb-1.5">
                            Pros
                          </label>
                          <textarea
                            name="pros"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-red-600 mb-1.5">
                            Cons
                          </label>
                          <textarea
                            name="cons"
                            required
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Effort (Man Hours)
                          </label>
                          <div className="space-y-3">
                            <input
                              type="number"
                              name="effort"
                              min="0"
                              required
                              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="e.g. 4"
                            />
                            <button
                              type="submit"
                              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100"
                            >
                              Add Proposal
                            </button>
                          </div>
                        </div>
                      </form>
                    </Card>

                    <div className="grid grid-cols-1 gap-6">
                      {editingIssue.resolutions.map((res) => (
                        <div
                          key={res.id}
                          className={`border-2 rounded-xl overflow-hidden transition-all relative group/card ${
                            res.isAgreed
                              ? "border-green-500 bg-green-50/20"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={() => deleteResolution(res.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors opacity-0 group-hover/card:opacity-100 bg-white shadow-sm"
                              title="Delete Resolution"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start bg-white gap-4">
                            <div className="flex items-center gap-3 w-full pr-8">
                              <div
                                className={`p-2 rounded-lg ${
                                  res.isAgreed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <ThumbsUp className="w-5 h-5" />
                              </div>
                              <div className="w-full">
                                <AutoTextArea
                                  value={res.solution}
                                  onChange={(e) =>
                                    updateResolution(
                                      res.id,
                                      "solution",
                                      e.target.value
                                    )
                                  }
                                  className="font-bold text-slate-800 text-lg bg-transparent w-full border-none focus:ring-0 px-0 py-0"
                                  placeholder="Solution title..."
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAgreement(res.id)}
                              className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shrink-0 ${
                                res.isAgreed
                                  ? "bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700"
                                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {res.isAgreed ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" /> AGREED
                                </>
                              ) : (
                                "Mark as Agreed"
                              )}
                            </button>
                          </div>

                          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div className="space-y-1">
                              <h5 className="font-bold text-green-700 uppercase text-[10px] tracking-wide">
                                Pros
                              </h5>
                              <AutoTextArea
                                value={res.pros}
                                onChange={(e) =>
                                  updateResolution(
                                    res.id,
                                    "pros",
                                    e.target.value
                                  )
                                }
                                className="text-slate-700 bg-transparent w-full text-sm"
                                placeholder="Pros..."
                              />
                            </div>
                            <div className="space-y-1">
                              <h5 className="font-bold text-red-700 uppercase text-[10px] tracking-wide">
                                Cons
                              </h5>
                              <AutoTextArea
                                value={res.cons}
                                onChange={(e) =>
                                  updateResolution(
                                    res.id,
                                    "cons",
                                    e.target.value
                                  )
                                }
                                className="text-slate-700 bg-transparent w-full text-sm"
                                placeholder="Cons..."
                              />
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-wide">
                                  Effort (Hours)
                                </h5>
                                <input
                                  type="number"
                                  value={res.effort}
                                  onChange={(e) =>
                                    updateResolution(
                                      res.id,
                                      "effort",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold text-xs w-20"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === "history" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card title="Audit Trail" icon={History}>
                      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2 my-4">
                        {editingIssue.auditLog
                          .slice()
                          .reverse()
                          .map((log) => (
                            <div key={log.id} className="relative pl-8 group">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-300 group-hover:border-indigo-600 transition-colors"></div>
                              <p className="text-slate-800 font-medium text-sm">
                                {log.action}
                              </p>
                              <span className="text-xs text-slate-400 font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
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
