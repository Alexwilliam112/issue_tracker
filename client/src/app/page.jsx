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

// --- Constants ---

const STATUS_FLOW = ["Open", "In Process", "Resolved"];
const ENVIRONMENTS = [
  "Development",
  "Staging",
  "Production",
  "Disaster Recovery",
  "N/A",
];
const BASE_URL = "https://api-officeless-dev.mekari.com/28208";

// --- Helper Functions ---

const toUnix = (dateString) =>
  dateString ? Math.floor(new Date(dateString).getTime() / 1000) : null;
const fromUnix = (timestamp) =>
  timestamp ? new Date(timestamp * 1000).toISOString().slice(0, 16) : "";
const fromUnixDate = (timestamp) =>
  timestamp ? new Date(timestamp * 1000).toLocaleDateString() : "-";

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

// --- Multi-Select Filter Component (Searchable & Object Support) ---

const MultiSelectFilter = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "Filter...",
}) => {
  // options: { id: string, name: string }[]
  // selected: string[] (IDs)
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

  const toggleOption = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  // Normalize options to always have id and name (handle simple string arrays)
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                  >
                    {selected.includes(opt.id) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{opt.name}</span>
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

// --- Searchable Single Select (Portal Based & Object Support) ---

const SearchableSingleSelect = ({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  icon: Icon,
  required,
}) => {
  // value: string (ID)
  // options: { id: string, name: string }[]
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

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt
  );

  const filtered = normalizedOptions.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedOption = normalizedOptions.find((opt) => opt.id === value);

  const handleSelect = (option) => {
    onChange(option.id);
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
          <span className={!selectedOption ? "text-slate-400 font-normal" : ""}>
            {selectedOption ? selectedOption.name : placeholder}
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
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between group
                                        ${
                                          value === opt.id
                                            ? "bg-indigo-50 text-indigo-700 font-bold"
                                            : "text-slate-700 hover:bg-slate-50"
                                        }
                                    `}
                  >
                    <span>{opt.name}</span>
                    {value === opt.id && (
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

// --- Searchable User Select (For Stakeholders) ---
const UserSearchSelect = ({ availableUsers, onAdd }) => {
  // availableUsers: {id, name}[]
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
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (user) => {
    onAdd(user.name); // Keeping logic simple for now (storing name for stakeholders), ideally ID
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
                    key={user.id}
                    onClick={() => handleAdd(user)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 rounded text-slate-700 flex items-center justify-between group"
                  >
                    <span>{user.name}</span>
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

// --- Risk Multi-Select Component (Updated with Search & Dynamic Options) ---

const RisksInput = ({ selectedRisks = [], onChange, options = [] }) => {
  // selectedRisks: string[] (IDs)
  // options: { id, name, score }[]

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

  const available = options.filter(
    (r) =>
      !selectedRisks.includes(r.id) &&
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addRisk = (riskId) => {
    onChange([...selectedRisks, riskId]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const removeRisk = (riskId) => {
    onChange(selectedRisks.filter((r) => r !== riskId));
  };

  const getRiskName = (id) => options.find((o) => o.id === id)?.name || id;

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
        {selectedRisks.map((riskId) => (
          <span
            key={riskId}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-100"
          >
            {getRiskName(riskId)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRisk(riskId);
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
                    key={risk.id}
                    type="button"
                    onClick={() => addRisk(risk.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between group text-slate-700 transition-colors"
                  >
                    {risk.name}
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
  const [issues, setIssues] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingIssue, setEditingIssue] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // API Data State
  const [apiUsers, setApiUsers] = useState([]);
  const [apiRisks, setApiRisks] = useState([]);
  const [apiProjects, setApiProjects] = useState([]);
  const [apiIssueTypes, setApiIssueTypes] = useState([]);
  const [apiIssueStages, setApiIssueStages] = useState([]);
  const [apiRootCauseCats, setApiRootCauseCats] = useState([]);

  // Derived options for UI (names)
  const userOptions = apiUsers.map((u) => ({ id: u.id, name: u.name }));
  // Note: Filter components expect array of objects {id, name} for full object usage or just strings.
  // We will pass the full objects to the filter components.

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

  // Fetch Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [users, risks, projects, types, stages, cats] = await Promise.all(
          [
            fetch(`${BASE_URL}/master_user/index?search=`).then((r) =>
              r.json()
            ),
            fetch(`${BASE_URL}/risk_matrix/index?search=`).then((r) =>
              r.json()
            ),
            fetch(`${BASE_URL}/projects/index?search=`).then((r) => r.json()),
            fetch(`${BASE_URL}/master_issue_type/index`).then((r) => r.json()),
            fetch(`${BASE_URL}/master_issue_stage/index`).then((r) => r.json()),
            fetch(`${BASE_URL}/master_root_cause_category/index`).then((r) =>
              r.json()
            ),
          ]
        );

        if (users.code === 200)
          setApiUsers(users.data.map((u) => ({ id: u.ids, name: u.name })));
        if (risks.code === 200)
          setApiRisks(
            risks.data.map((r) => ({ id: r.ids, name: r.name, score: r.score }))
          );
        if (projects.code === 200)
          setApiProjects(
            projects.data.map((p) => ({ id: p.ids, name: p.name }))
          );
        if (types.code === 200)
          setApiIssueTypes(
            types.data.map((t) => ({ id: t.ids, name: t.name }))
          );
        if (stages.code === 200)
          setApiIssueStages(
            stages.data.map((s) => ({ id: s.ids, name: s.name }))
          );
        if (cats.code === 200)
          setApiRootCauseCats(
            cats.data.map((c) => ({ id: c.ids, name: c.name }))
          );
      } catch (err) {
        console.error("Failed to fetch master data:", err);
      }
    };
    fetchMasterData();
    setIsMounted(true);
  }, []);

  // Fetch Issues (Server Side Filtering)
  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      params.append("search", searchTerm);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (appliedFilters.project.length)
        params.append("project_ids", appliedFilters.project.join(","));
      if (appliedFilters.environment.length)
        params.append("environment", appliedFilters.environment.join(","));
      if (appliedFilters.issueType.length)
        params.append("issue_type_ids", appliedFilters.issueType.join(","));
      if (appliedFilters.stage.length)
        params.append("issue_stage_ids", appliedFilters.stage.join(","));
      if (appliedFilters.rootCause.length)
        params.append(
          "root_cause_category_ids",
          appliedFilters.rootCause.join(",")
        );
      if (appliedFilters.risks.length)
        params.append("risk_ids", appliedFilters.risks.join(","));
      if (appliedFilters.status.length)
        params.append("status", appliedFilters.status.join(","));
      if (appliedFilters.assignees.length)
        params.append("assignee_ids", appliedFilters.assignees.join(","));

      if (appliedFilters.startDate)
        params.append(
          "reported_start_date",
          toUnix(appliedFilters.startDate).toString()
        );
      if (appliedFilters.endDate)
        params.append(
          "reported_end_date",
          toUnix(appliedFilters.endDate).toString()
        );
      if (appliedFilters.resolvedStartDate)
        params.append(
          "resolved_start_date",
          toUnix(appliedFilters.resolvedStartDate).toString()
        );
      if (appliedFilters.resolvedEndDate)
        params.append(
          "resolved_end_date",
          toUnix(appliedFilters.resolvedEndDate).toString()
        );

      const res = await fetch(`${BASE_URL}/issues/index?${params.toString()}`);
      const json = await res.json();

      if (json.code === 200) {
        const mappedIssues = json.data.map((apiIssue) => ({
          id: apiIssue.ids, // Use string ID from API
          title: apiIssue.name,
          status: apiIssue.status,
          // Map object responses to IDs for internal logic, but store full objects if needed for display?
          // For simplicity, we map to what UI expects (IDs for editing, but we need Names for table).
          // Strategy: Store Object for Table, use IDs for edit form.
          // Actually, the table just needs strings.
          project: apiIssue.project_id?.name || "",
          projectId: apiIssue.project_id?.id,

          environment: apiIssue.environment,

          issueType: apiIssue.issue_type_id?.name || "",
          issueTypeId: apiIssue.issue_type_id?.id,

          assignee: apiIssue.assignee_id?.name || "",
          assigneeId: apiIssue.assignee_id?.id,

          stage: apiIssue.issue_stage_id?.name || "",
          stageId: apiIssue.issue_stage_id?.id,

          rootCauseCategory: apiIssue.root_cause_category_id?.name || "",
          rootCauseCategoryId: apiIssue.root_cause_category_id?.id,

          rootCause: apiIssue.root_cause_detail,

          risks: apiIssue.risk_ids ? apiIssue.risk_ids.map((r) => r.id) : [], // IDs for internal logic
          riskNames: apiIssue.risk_ids
            ? apiIssue.risk_ids.map((r) => r.name)
            : [], // Display
          riskScore: apiIssue.risk_score,

          reportedBy: apiIssue.reported_by,
          reportedAt: fromUnix(apiIssue.reported_at), // Convert to ISO for input
          closedAt: fromUnix(apiIssue.closed_at),

          context: apiIssue.context,
          problemStatement: apiIssue.problem,
          evidence: apiIssue.troubleshooting_log,

          // Nested data (stubbed for now as API list doesn't return full detail)
          escalations: [],
          resolutions: [],
          comments: [],
          auditLog: [],
        }));
        setIssues(mappedIssues);
        setTotalData(json.pagination?.total_data || 0);
      }
    } catch (err) {
      console.error("Failed to fetch issues", err);
    }
  };

  // Trigger Fetch
  useEffect(() => {
    if (isMounted) fetchIssues();
  }, [isMounted, pagination, appliedFilters, searchTerm]);

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

  // --- Pagination Logic ---
  const totalPages = Math.ceil(totalData / pagination.limit);

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

  // --- Status Summary Counts (Note: Client side count is inaccurate with server pagination, would ideally come from API stats) ---
  // For now, we just count what's visible or leave as 0 if not provided by API summary endpoint
  const statusCounts = { Open: 0, "In Process": 0, Resolved: 0 };

  // --- Actions ---

  const validateIssue = (issue) => {
    const required = [
      "title",
      "projectId",
      "environment",
      "issueTypeId",
      "reportedBy",
      "reportedAt",
      "context",
      "problemStatement",
    ];
    const missing = required.filter((field) => !issue[field]);
    return missing;
  };

  const handleSave = async () => {
    if (!editingIssue) return;

    const missingFields = validateIssue(editingIssue);
    if (missingFields.length > 0) {
      alert(
        `Please fill in all mandatory fields. Missing: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    // Helper to find the full object from the ID for the payload
    const getObjPayload = (sourceArray, id) => {
      const found = sourceArray.find((item) => item.id === id);
      return found ? { id: found.id, name: found.name } : null;
    };

    // Helper to map Risk IDs to full Risk objects
    const getRiskPayload = (riskIds) => {
      return riskIds
        .map((id) => {
          const found = apiRisks.find((r) => r.id === id);
          return found
            ? { id: found.id, name: found.name, score: found.score }
            : null;
        })
        .filter(Boolean);
    };

    const payload = {
      name: editingIssue.title,
      project_id: getObjPayload(apiProjects, editingIssue.projectId),
      environment: editingIssue.environment,
      issue_type_id: getObjPayload(apiIssueTypes, editingIssue.issueTypeId),
      reported_by: editingIssue.reportedBy,
      reported_at: toUnix(editingIssue.reportedAt),
      assignee_id: getObjPayload(apiUsers, editingIssue.assigneeId),
      context: editingIssue.context,
      problem: editingIssue.problemStatement,
      status: editingIssue.status,
      issue_stage_id: getObjPayload(apiIssueStages, editingIssue.stageId),
      risk_ids: getRiskPayload(editingIssue.risks),
      risk_score: editingIssue.riskScore,
      closed_at: toUnix(editingIssue.closedAt),
      troubleshooting_log: editingIssue.evidence,
      root_cause_category_id: getObjPayload(
        apiRootCauseCats,
        editingIssue.rootCauseCategoryId
      ),
      root_cause_detail: editingIssue.rootCause,
    };

    try {
      if (isCreating) {
        const res = await fetch(`${BASE_URL}/issues/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) fetchIssues();
      } else {
        const res = await fetch(
          `${BASE_URL}/issues/update?id_issue=${editingIssue.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) fetchIssues();
      }
      closeModal();
    } catch (e) {
      alert("Failed to save issue");
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!editingIssue) return;
    if (
      confirm(
        "Are you sure you want to delete this issue? This action cannot be undone."
      )
    ) {
      try {
        await fetch(`${BASE_URL}/issues/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingIssue.id }),
        });
        fetchIssues();
        closeModal();
      } catch (e) {
        alert("Failed to delete");
      }
    }
  };

  // --- Nested Tab Handlers (Escalation, Resolution, Comments) ---
  // Currently client-side only as requested, will reset on refresh until backend supports them.

  const addEscalationLayer = () => {
    if (!editingIssue) return;
    const layerNum = editingIssue.escalations.length + 1;
    const newLayer = {
      id: Date.now(),
      layer: layerNum,
      stakeholders: [],
      status: "Pending",
      remarks: "",
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

  const updateEscalationRemarks = (layerId, newRemarks) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        escalations: prev.escalations.map((e) =>
          e.id === layerId ? { ...e, remarks: newRemarks } : e
        ),
      };
    });
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

  // --- Edit Actions (Applied to `editingIssue`) ---

  const updateDraftField = (field, value) => {
    setEditingIssue((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateRisks = (newRisks) => {
    setEditingIssue((prev) => {
      if (!prev) return null;
      const totalScore = newRisks.reduce((acc, riskId) => {
        const riskObj = apiRisks.find((r) => r.id === riskId);
        return acc + (riskObj ? riskObj.score || 0 : 0);
      }, 0);
      return { ...prev, risks: newRisks, riskScore: totalScore };
    });
  };

  const updateStatus = (newStatus) => {
    updateDraftField("status", newStatus);
  };

  const updateStage = (newStageId) => {
    const stageName = apiIssueStages.find((s) => s.id === newStageId)?.name;
    setEditingIssue((prev) =>
      prev ? { ...prev, stageId: newStageId, stage: stageName } : null
    );
  };

  const openCreateModal = () => {
    const blankIssue = {
      id: "new",
      title: "",
      status: "Open",
      stage: "Triage",
      stageId: apiIssueStages.find((s) => s.name === "Triage")?.id || "",
      created: new Date().toISOString(),
      reportedBy: "",
      reportedAt: new Date().toISOString().slice(0, 16),
      environment: "Development",
      project: "",
      projectId: "",
      issueType: "",
      issueTypeId: "",
      rootCauseCategory: "",
      rootCauseCategoryId: "",
      rootCause: "",
      assignee: "",
      assigneeId: "",
      closedAt: "",
      risks: [],
      riskScore: 0,
      context: "",
      problemStatement: "",
      evidence: "",
      escalations: [],
      resolutions: [],
      comments: [],
      auditLog: [],
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

  const visibleTabs = ["overview", "escalations", "resolutions"];
  if (!isCreating) visibleTabs.push("history");

  // ... Export Logic ...
  const exportToCSV = () => {
    if (issues.length === 0) return;
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
      "Latest Escalation Remarks",
      "Agreed Resolution (Solution)",
      "Agreed Resolution (Effort)",
      "Closed At",
    ];
    const rows = issues.map((issue) => {
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
        latestEscalation
          ? `"${(latestEscalation.remarks || "").replace(/"/g, '""')}"`
          : "N/A",
        agreedResolution
          ? `"${agreedResolution.solution.replace(/"/g, '""')}"`
          : "N/A",
        agreedResolution ? agreedResolution.effort : "0",
        issue.closedAt ? new Date(issue.closedAt).toLocaleString() : "",
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
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
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between h-24 ${borderClass} ${bgClass} ${
                  isSelected ? "ring-2 ring-offset-2 ring-indigo-500" : ""
                }`}
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
            </button>
          </div>

          {showFilters && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MultiSelectFilter
                  label="Project"
                  options={apiProjects}
                  selected={filterInputs.project}
                  onChange={(v) => updateFilterInput("project", v)}
                />
                <MultiSelectFilter
                  label="Environment"
                  options={ENVIRONMENTS.map((e) => ({ id: e, name: e }))}
                  selected={filterInputs.environment}
                  onChange={(v) => updateFilterInput("environment", v)}
                />
                <MultiSelectFilter
                  label="Issue Type"
                  options={apiIssueTypes}
                  selected={filterInputs.issueType}
                  onChange={(v) => updateFilterInput("issueType", v)}
                />
                <MultiSelectFilter
                  label="Status"
                  options={STATUS_FLOW.map((s) => ({ id: s, name: s }))}
                  selected={filterInputs.status}
                  onChange={(v) => updateFilterInput("status", v)}
                />
                <MultiSelectFilter
                  label="Stage"
                  options={apiIssueStages}
                  selected={filterInputs.stage}
                  onChange={(v) => updateFilterInput("stage", v)}
                />
                <MultiSelectFilter
                  label="Root Cause"
                  options={apiRootCauseCats}
                  selected={filterInputs.rootCause}
                  onChange={(v) => updateFilterInput("rootCause", v)}
                />
                <MultiSelectFilter
                  label="Risks"
                  options={apiRisks}
                  selected={filterInputs.risks}
                  onChange={(v) => updateFilterInput("risks", v)}
                />
                <MultiSelectFilter
                  label="Assignee"
                  options={apiUsers}
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
                <th className="px-6 py-4 w-32">Assignee</th>
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
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => openViewModal(issue.id)}
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    #{issue.id.slice(-4)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-normal text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {issue.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {issue.reportedAt
                      ? new Date(issue.reportedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {issue.reportedBy}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {issue.assignee || "-"}
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
              {issues.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-6 py-8 text-center text-slate-400 text-sm italic"
                  >
                    No issues found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              {Math.min(pagination.page * pagination.limit, totalData)} of{" "}
              {totalData}
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
              Page {pagination.page} of{" "}
              {Math.ceil(totalData / pagination.limit) || 1}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={
                pagination.page >= Math.ceil(totalData / pagination.limit)
              }
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
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card title="Issue Details" icon={Briefcase}>
                          <div className="space-y-3">
                            <SearchableSingleSelect
                              required
                              label="Project"
                              options={apiProjects}
                              value={editingIssue.projectId}
                              onChange={(v) => updateDraftField("projectId", v)}
                            />
                            <SearchableSingleSelect
                              required
                              label="Environment"
                              options={ENVIRONMENTS.map((e) => ({
                                id: e,
                                name: e,
                              }))}
                              value={editingIssue.environment}
                              onChange={(v) =>
                                updateDraftField("environment", v)
                              }
                            />
                            <SearchableSingleSelect
                              required
                              label="Issue Type"
                              options={apiIssueTypes}
                              value={editingIssue.issueTypeId}
                              onChange={(v) =>
                                updateDraftField("issueTypeId", v)
                              }
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
                              options={apiUsers}
                              value={editingIssue.assigneeId}
                              onChange={(v) =>
                                updateDraftField("assigneeId", v)
                              }
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
                              options={apiRootCauseCats}
                              value={editingIssue.rootCauseCategoryId}
                              onChange={(v) =>
                                updateDraftField("rootCauseCategoryId", v)
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
                            options={apiIssueStages}
                            value={editingIssue.stageId}
                            onChange={(v) => updateStage(v)}
                          />
                        </div>
                      </Card>
                      <Card title="Risk Assessment" icon={ShieldAlert}>
                        <div className="space-y-4">
                          <RisksInput
                            selectedRisks={editingIssue.risks || []}
                            onChange={updateRisks}
                            options={apiRisks}
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
                                  availableUsers={userOptions.filter(
                                    (u) =>
                                      !esc.stakeholders.some(
                                        (s) => s.name === u.name
                                      )
                                  )}
                                  onAdd={(name) => addStakeholder(esc.id, name)}
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
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                                Result Remarks
                              </label>
                              <AutoTextArea
                                value={esc.remarks}
                                onChange={(e) =>
                                  updateEscalationRemarks(
                                    esc.id,
                                    e.target.value
                                  )
                                }
                                className="text-sm text-slate-700 w-full bg-slate-50 rounded p-2"
                                placeholder="Add remarks about the outcome of this escalation layer..."
                                minRows={2}
                              />
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
