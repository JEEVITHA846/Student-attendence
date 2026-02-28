
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Zap, 
  Calendar as CalendarIcon,
  ArrowLeft,
  UserCheck,
  UserX,
  UserMinus,
  CheckCircle2,
  Tag,
  Loader2,
  AlertCircle,
  MessageSquare,
  StickyNote
} from 'lucide-react';
import { Student, AttendanceStatus, AttendanceRecord } from '../types';
import { CLASSES } from '../constants';

interface AttendanceProps {
  students: Student[];
  onSave: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;
  onNavigateHome: () => void;
  editModeData?: {
    date: string,
    timestamp: string,
    records: AttendanceRecord[]
  }
}

const Attendance: React.FC<AttendanceProps> = ({ students, onSave, onNavigateHome, editModeData }) => {
  const getLocalDate = () => new Date().toLocaleDateString('en-CA');

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [sessionName, setSessionName] = useState('');
  const [sessionRemark, setSessionRemark] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES[1]);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marking, setMarking] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [visibleRemarkId, setVisibleRemarkId] = useState<string | null>(null);
  
  const [showSummary, setShowSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedRecords, setLastSavedRecords] = useState<Omit<AttendanceRecord, 'id'>[]>([]);

  const availablePeriods = [1, 2, 3, 4, 5, 6, 7];

  // Initialize marking and remarks state
  useEffect(() => {
    const initialMarking: Record<string, AttendanceStatus> = {};
    const initialRemarks: Record<string, string> = {};
    
    students.forEach(s => {
      const existing = editModeData?.records.find(r => r.student_id === s.id);
      initialMarking[s.id] = existing ? existing.status : AttendanceStatus.PRESENT;
      initialRemarks[s.id] = existing?.remark || '';
    });
    
    setMarking(initialMarking);
    setRemarks(initialRemarks);

    if (editModeData) {
      setSelectedDate(editModeData.date);
      setSessionName(editModeData.records[0]?.subject || '');
      setSessionRemark(''); 
      setSelectedClass(editModeData.records[0]?.class || CLASSES[1]);

      const periodMatch = editModeData.timestamp.match(/^P([\d,]+)/);
      if (periodMatch) {
        setSelectedPeriods(periodMatch[1].split(',').map(Number));
      }
    }
  }, [students, editModeData]);

  const handleStatusChange = (student_id: string, status: AttendanceStatus) => {
    setMarking(prev => ({ ...prev, [student_id]: status }));
  };

  const handleRemarkChange = (student_id: string, text: string) => {
    setRemarks(prev => ({ ...prev, [student_id]: text }));
  };

  const markAllPresent = () => {
    const nextMarking = { ...marking };
    students.forEach(s => nextMarking[s.id] = AttendanceStatus.PRESENT);
    setMarking(nextMarking);
  };

  const togglePeriod = (p: number) => {
    setSelectedPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p].sort());
  };

  const handleSubmit = async () => {
    if (students.length === 0) {
      setError("No students found to mark.");
      return;
    }
    if (selectedPeriods.length === 0) {
      setError("Select at least one period.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const now = new Date();
      const timeOnly = editModeData?.timestamp.split(' - ')[1] || 
        now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      const timestampStr = `P${selectedPeriods.join(',')} - ${timeOnly}`;
      const finalSessionName = sessionName.trim() || `Session ${timestampStr}`;

      const records: Omit<AttendanceRecord, 'id'>[] = students.map((s, index) => ({
        student_id: s.id,
        date: selectedDate,
        timestamp: timestampStr,
        status: marking[s.id] || AttendanceStatus.PRESENT,
        class: selectedClass,
        subject: finalSessionName,
        remark: index === 0 && sessionRemark ? `[Global Note: ${sessionRemark}] ${remarks[s.id] || ''}` : (remarks[s.id] || '')
      }));

      await onSave(records);
      setLastSavedRecords(records);
      setShowSummary(true);
    } catch (err: any) {
      console.error('Commit Error:', err);
      setError(err.message || "Could not connect to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const search = searchTerm.toLowerCase();
      const name = (s.name || '').toLowerCase();
      const roll = (s.roll_no || '').toLowerCase();
      return name.includes(search) || roll.includes(search);
    });
  }, [students, searchTerm]);

  const actionButtons = (isMobile: boolean = false) => (
    <div className={`flex items-center gap-3 ${isMobile ? 'w-full' : ''}`}>
      <button 
        onClick={markAllPresent}
        disabled={isSaving}
        className={`${isMobile ? 'flex-1' : ''} px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50`}
      >
        All Present
      </button>
      <button 
        onClick={handleSubmit}
        disabled={isSaving}
        className={`${isMobile ? 'flex-[1.5]' : 'px-10'} py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70`}
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
        {editModeData ? 'Update Record' : 'Commit Session'}
      </button>
    </div>
  );

  if (showSummary) {
    const currentName = lastSavedRecords[0]?.subject || 'Attendance Logged';
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Success</h1>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                {selectedDate} • {currentName}
              </p>
            </div>
          </div>
          <button 
            onClick={onNavigateHome}
            className="w-full md:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 text-center">
            <p className="text-4xl font-black text-emerald-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.PRESENT).length}</p>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Present</p>
          </div>
          <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 text-center">
            <p className="text-4xl font-black text-rose-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.ABSENT).length}</p>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Absent</p>
          </div>
          <div className="bg-cyan-50 p-8 rounded-[2rem] border border-cyan-100 text-center">
            <p className="text-4xl font-black text-cyan-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.OD).length}</p>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">O.D.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-24 lg:pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                {editModeData ? 'Modify Data' : 'Attendance'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                Real-time Class Tracking
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {error && (
            <div className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-tight border border-rose-100 max-w-md">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}
          {/* Hide header buttons on mobile, show on desktop */}
          <div className="hidden lg:block">
            {actionButtons()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <div className="relative group">
                <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Session / Folder Name</label>
              <div className="relative group">
                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Afternoon Batch"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Periods</label>
              <div className="flex flex-wrap gap-2">
                {availablePeriods.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePeriod(p)}
                    className={`w-11 h-11 rounded-xl font-black text-xs transition-all ${
                      selectedPeriods.includes(p) 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    P{p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <StickyNote size={14} className="text-blue-500" /> Session Notes
              </label>
              <textarea 
                placeholder="Special notes for this batch..."
                value={sessionRemark}
                onChange={(e) => setSessionRemark(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filter students by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-8 outline-none shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-sm"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto custom-scrollbar">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <div key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase">
                        {student.name ? student.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-tight">{student.name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.department}</p>
                          <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{student.roll_no}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setVisibleRemarkId(visibleRemarkId === student.id ? null : student.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          remarks[student.id] 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-slate-50 text-slate-300 hover:text-blue-400'
                        }`}
                        title="Add Remark"
                      >
                        <MessageSquare size={18} fill={remarks[student.id] ? "currentColor" : "none"} />
                      </button>
                      
                      <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block"></div>

                      {[
                        { status: AttendanceStatus.PRESENT, label: 'P', color: 'emerald' },
                        { status: AttendanceStatus.ABSENT, label: 'A', color: 'rose' },
                        { status: AttendanceStatus.OD, label: 'OD', color: 'cyan' }
                      ].map((btn) => (
                        <button
                          key={btn.status}
                          onClick={() => handleStatusChange(student.id, btn.status)}
                          className={`w-12 h-12 rounded-xl font-black text-[11px] transition-all ${
                            marking[student.id] === btn.status
                              ? `bg-${btn.color}-600 text-white shadow-lg`
                              : `bg-slate-50 text-slate-300 hover:bg-slate-100`
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleRemarkId === student.id && (
                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                        <MessageSquare size={14} className="text-blue-400" />
                        <input 
                          type="text"
                          placeholder={`Add a note for ${student.name ? student.name.split(' ')[0] : 'student'}...`}
                          value={remarks[student.id] || ''}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-300"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No students found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar: Only visible on mobile (below lg) */}
      {!showSummary && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500">
          {actionButtons(true)}
        </div>
      )}
    </div>
  );
};

export default Attendance;
