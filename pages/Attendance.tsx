
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Zap, 
  Calendar as CalendarIcon,
  ArrowLeft,
  UserCheck,
  UserX,
  UserMinus,
  CheckCircle2,
  CheckSquare,
  Edit,
  XCircle
} from 'lucide-react';
import { Student, AttendanceStatus, AttendanceRecord } from '../types';
import { CLASSES } from '../constants';

interface AttendanceProps {
  students: Student[];
  onSave: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  editModeData?: {
    date: string,
    timestamp: string,
    records: AttendanceRecord[]
  }
}

const Attendance: React.FC<AttendanceProps> = ({ students, onSave, editModeData }) => {
  const [selectedDate, setSelectedDate] = useState(editModeData?.date || new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(editModeData?.records[0]?.class || CLASSES[1]);
  const [selectedElective, setSelectedElective] = useState(editModeData?.records[0]?.subject || 'Cloud Computing');
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marking, setMarking] = useState<Record<string, AttendanceStatus>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [lastSavedRecords, setLastSavedRecords] = useState<Omit<AttendanceRecord, 'id'>[]>([]);

  const availablePeriods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      const existing = editModeData?.records.find(r => r.student_id === s.id);
      initial[s.id] = existing ? existing.status : AttendanceStatus.PRESENT;
    });
    setMarking(initial);

    if (editModeData?.timestamp) {
        const periodMatch = editModeData.timestamp.match(/^P([\d,]+)/);
        if (periodMatch) {
            const periods = periodMatch[1].split(',').map(Number);
            setSelectedPeriods(periods);
        }
    }
  }, [students, editModeData]);

  const handleStatusChange = (student_id: string, status: AttendanceStatus) => {
    setMarking(prev => ({ ...prev, [student_id]: status }));
  };

  const markAllPresent = () => {
    const nextMarking = { ...marking };
    students.forEach(s => nextMarking[s.id] = AttendanceStatus.PRESENT);
    setMarking(nextMarking);
  };

  const togglePeriod = (p: number) => {
    setSelectedPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p].sort());
  };

  const handleSubmit = () => {
    const now = new Date();
    const timestampStr = editModeData ? editModeData.timestamp : `P${selectedPeriods.join(',')} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const records: Omit<AttendanceRecord, 'id'>[] = students.map(s => ({
      student_id: s.id,
      date: selectedDate,
      timestamp: timestampStr,
      status: marking[s.id] || AttendanceStatus.PRESENT,
      class: selectedClass,
      subject: selectedElective,
    }));

    setLastSavedRecords(records);
    onSave(records);
    setShowSummary(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.includes(searchTerm)
  );

  if (showSummary) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {editModeData ? 'Records Updated' : 'Records Committed'}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedDate} • {selectedElective}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSummary(false)}
            className="w-full md:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
            Start New Entry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 text-center">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCheck size={28} />
            </div>
            <p className="text-4xl font-black text-emerald-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.PRESENT).length}</p>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Present</p>
          </div>
          <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 text-center">
            <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserX size={28} />
            </div>
            <p className="text-4xl font-black text-rose-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.ABSENT).length}</p>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Absent</p>
          </div>
          <div className="bg-cyan-50 p-8 rounded-[2rem] border border-cyan-100 text-center">
            <div className="w-14 h-14 bg-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserMinus size={28} />
            </div>
            <p className="text-4xl font-black text-cyan-600 mb-1">{lastSavedRecords.filter(r => r.status === AttendanceStatus.OD).length}</p>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">O.D.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(['Present', 'Absent', 'OD'] as const).map((status) => (
            <div key={status} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'Present' ? 'bg-emerald-500' : status === 'Absent' ? 'bg-rose-500' : 'bg-cyan-500'
                }`}></div>
                {status.toUpperCase()}
              </h3>
              <div className="space-y-4">
                {lastSavedRecords.filter(r => r.status === status).map((r, index) => {
                   const s = students.find(std => std.id === r.student_id);
                   return (
                    <div key={`${r.student_id}-${index}`} className={`p-5 rounded-2xl ${
                      status === 'Present' ? 'bg-slate-50' : status === 'Absent' ? 'bg-rose-50/50' : 'bg-cyan-50/50'
                    }`}>
                      <p className="text-base font-black text-slate-900 leading-tight">{s?.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s?.department}</p>
                        <span className="text-[12px] font-black text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/50 tracking-tight">{s?.roll_no}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8 lg:space-y-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {editModeData ? <Edit className="text-blue-500" /> : null}
            {editModeData ? 'Modify Session' : 'Tracking'}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {editModeData ? `Editing existing log for ${editModeData.date}` : 'Attendance Management'}
          </p>
        </div>
        
        {/* Commit Button (Hidden on mobile header, shown on desktop) */}
        <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
           {editModeData && (
             <button 
                onClick={() => window.location.reload()} 
                className="flex-1 md:flex-none px-6 py-4 bg-white text-slate-500 rounded-2xl font-bold text-sm border border-slate-100 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <XCircle size={18} />
                Discard
              </button>
           )}
           <button 
             onClick={handleSubmit}
             className={`w-full md:w-auto px-10 py-4 ${editModeData ? 'bg-blue-600' : 'bg-[#0f172a]'} text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
           >
             <Zap size={18} className={`${editModeData ? 'text-white fill-white' : 'text-blue-400 fill-blue-400'}`} />
             {editModeData ? 'Save Changes' : 'Commit Records'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm ${editModeData ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Date Selection</label>
          <div className="relative bg-slate-50 rounded-2xl p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3 pointer-events-none">
              <CalendarIcon size={18} className="text-blue-500" />
              <span className="text-sm font-black text-slate-900">
                {selectedDate.split('-').reverse().join('-')}
              </span>
            </div>
            <CalendarIcon size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        <div className={`bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm ${editModeData ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assign Periods</label>
          <div className="flex flex-wrap gap-2.5">
            {availablePeriods.map(p => (
              <button
                key={p}
                onClick={() => togglePeriod(p)}
                className={`w-11 h-11 rounded-xl text-xs font-black transition-all ${
                  selectedPeriods.includes(p) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-50 rounded-[1.5rem] py-4 pl-14 pr-6 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 font-bold text-sm"
            />
         </div>
         <button 
           onClick={markAllPresent}
           className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-colors active:scale-95"
         >
            <CheckSquare size={16} /> Mark All Present
         </button>
      </div>

      <div className="space-y-4 pb-32">
        <div className="hidden md:grid md:grid-cols-12 px-10 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
           <div className="col-span-8">Student Identity</div>
           <div className="col-span-4 text-right">Attendance Status</div>
        </div>

        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 md:p-5 hover:shadow-md transition-all animate-in slide-in-from-bottom-2"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base leading-tight truncate">{student.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.department}</p>
                        <span className="text-[12px] font-black text-blue-600 bg-blue-50/50 px-2.5 py-0.5 rounded-lg border border-blue-100/50 tracking-tight">
                          {student.roll_no}
                        </span>
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 w-full md:w-auto">
                    {[
                      { s: AttendanceStatus.PRESENT, l: 'P', color: 'blue' },
                      { s: AttendanceStatus.ABSENT, l: 'A', color: 'rose' },
                      { s: AttendanceStatus.OD, l: 'OD', color: 'cyan' }
                    ].map(opt => {
                      const isActive = marking[student.id] === opt.s;
                      let activeClass = "bg-slate-50 text-slate-300";
                      
                      if (isActive) {
                        if (opt.color === 'blue') activeClass = "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105";
                        else if (opt.color === 'rose') activeClass = "bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105";
                        else activeClass = "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 scale-105";
                      }

                      return (
                        <button 
                          key={opt.s}
                          onClick={() => handleStatusChange(student.id, opt.s)}
                          className={`flex-1 md:w-14 h-12 rounded-2xl text-[11px] font-black uppercase transition-all duration-300 ${activeClass}`}
                        >
                          {opt.l}
                        </button>
                      );
                    })}
                 </div>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <p className="text-sm font-black text-slate-300 tracking-tight">No results found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Commit Button (Visible only on mobile bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-slate-100 z-[60] flex gap-3">
        {editModeData && (
          <button 
            onClick={() => window.location.reload()} 
            className="flex-1 px-4 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <XCircle size={18} />
          </button>
        )}
        <button 
          onClick={handleSubmit}
          className={`flex-[3] px-10 py-4 ${editModeData ? 'bg-blue-600' : 'bg-[#0f172a]'} text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
        >
          <Zap size={18} className={`${editModeData ? 'text-white fill-white' : 'text-blue-400 fill-blue-400'}`} />
          {editModeData ? 'Save Changes' : 'Commit Records'}
        </button>
      </div>
    </div>
  );
};

export default Attendance;
