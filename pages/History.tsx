
import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  ChevronRight, 
  FileText, 
  ArrowLeft,
  Trash2,
  LayoutGrid,
  Search,
  UserCheck,
  UserX,
  UserMinus,
  Clock,
  Edit3
} from 'lucide-react';
import { AttendanceRecord, Student, AttendanceStatus } from '../types';

interface HistoryProps {
  records: AttendanceRecord[];
  students: Student[];
  onDeleteFolder: (date: string) => void;
  onDeleteSession: (date: string, timestamp: string) => void;
  onEditSession: (date: string, timestamp: string) => void;
}

const HistoryPage: React.FC<HistoryProps> = ({ 
  records, 
  students,
  onDeleteFolder, 
  onDeleteSession,
  onEditSession
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dateFolders = useMemo(() => {
    const folders: Record<string, AttendanceRecord[]> = {};
    records.forEach(r => {
      if (!folders[r.date]) folders[r.date] = [];
      folders[r.date].push(r);
    });
    return folders;
  }, [records]);

  const currentSessionRecords = useMemo(() => {
    if (!selectedFolder || !selectedSession || !dateFolders[selectedFolder]) return [];
    return dateFolders[selectedFolder].filter(r => r.timestamp === selectedSession);
  }, [selectedFolder, selectedSession, dateFolders]);

  const detailData = useMemo(() => {
    if (!currentSessionRecords.length) return null;
    return {
      present: currentSessionRecords.filter(r => r.status === AttendanceStatus.PRESENT),
      absent: currentSessionRecords.filter(r => r.status === AttendanceStatus.ABSENT),
      od: currentSessionRecords.filter(r => r.status === AttendanceStatus.OD),
    };
  }, [currentSessionRecords]);

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else {
      setSelectedFolder(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Work History</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {selectedSession ? 'Detailed Breakdown' : selectedFolder ? 'Session Logs' : 'Archive Folders'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-48">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Lookup history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-xs font-bold border-none shadow-sm outline-none focus:ring-2 focus:ring-blue-500/10" 
              />
           </div>
           <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-50 shrink-0">
              <LayoutGrid size={18} className="text-blue-600" />
           </div>
        </div>
      </div>

      {/* Folders View */}
      {!selectedFolder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
          {Object.keys(dateFolders).length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <Folder size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No entries found</p>
              </div>
          ) : (
              Object.keys(dateFolders).sort().reverse().map(date => (
                  <div key={date} className="relative group">
                    <button 
                      onClick={() => setSelectedFolder(date)}
                      className="w-full bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all text-left group"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Folder size={32} className="fill-blue-600/10" />
                      </div>
                      <p className="text-lg font-black text-slate-900 mb-1">{date}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {Array.from(new Set(dateFolders[date].map(r => r.timestamp))).length} Sessions
                      </p>
                    </button>
                    <button 
                      onClick={() => onDeleteFolder(date)}
                      className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
          )}
        </div>
      )}

      {/* Sessions View */}
      {selectedFolder && !selectedSession && (
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300 mb-24">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest outline-none">
                  <ArrowLeft size={18} /> Back
             </button>
             <h2 className="text-lg font-black text-slate-900">{selectedFolder}</h2>
          </div>
          <div className="p-8">
              <div className="space-y-4">
                  {Object.keys((dateFolders[selectedFolder] || []).reduce((acc: any, curr) => {
                      acc[curr.timestamp] = acc[curr.timestamp] || [];
                      acc[curr.timestamp].push(curr);
                      return acc;
                  }, {})).map(time => (
                    <div key={time} className="flex items-center gap-3 group">
                      <button 
                        onClick={() => setSelectedSession(time)}
                        className="flex-1 flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 text-left overflow-hidden outline-none"
                      >
                           <div className="flex items-center gap-5 min-w-0">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm shrink-0">
                                  <FileText size={24} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-sm font-black text-slate-900 truncate">{time}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tap to view students</p>
                              </div>
                           </div>
                           <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                      
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-2">
                        <button 
                          onClick={() => onEditSession(selectedFolder, time)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Session"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteSession(selectedFolder, time)}
                          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* Details View */}
      {selectedFolder && selectedSession && detailData && (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-300 pb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
             <div className="flex items-center gap-4 sm:gap-8">
               <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest outline-none">
                    <ArrowLeft size={18} /> Back
               </button>
               <div className="w-px h-5 bg-slate-100 hidden sm:block"></div>
               <button 
                 onClick={() => onEditSession(selectedFolder, selectedSession)}
                 className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest outline-none"
               >
                 <Edit3 size={16} /> Edit Session
               </button>
             </div>
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                <Clock size={16} className="text-blue-600" />
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{selectedSession}</h2>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-center">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <UserCheck size={28} />
              </div>
              <p className="text-5xl font-black text-emerald-600 mb-1">{detailData.present.length}</p>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Present</p>
            </div>
            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
                <UserX size={28} />
              </div>
              <p className="text-5xl font-black text-rose-600 mb-1">{detailData.absent.length}</p>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Absent</p>
            </div>
            <div className="bg-cyan-50 p-8 rounded-[2.5rem] border border-cyan-100 text-center">
              <div className="w-14 h-14 bg-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                <UserMinus size={28} />
              </div>
              <p className="text-5xl font-black text-cyan-600 mb-1">{detailData.od.length}</p>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">O.D.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {[
               { title: 'Present', data: detailData.present, color: 'bg-emerald-500', bg: 'bg-slate-50' },
               { title: 'Absent', data: detailData.absent, color: 'bg-rose-500', bg: 'bg-rose-50/30' },
               { title: 'O.D.', data: detailData.od, color: 'bg-cyan-500', bg: 'bg-cyan-50/30' }
             ].map((col, idx) => (
               <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
                  <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                    {col.title}
                  </h3>
                  <div className="space-y-4">
                    {col.data.map(rec => {
                      const student = students.find(s => s.id === rec.student_id);
                      return (
                        <div key={rec.id} className={`p-5 ${col.bg} rounded-2xl border border-transparent`}>
                          <p className="text-base font-black text-slate-900 leading-tight">{student?.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">{student?.department} • {student?.roll_no}</p>
                        </div>
                      );
                    })}
                    {col.data.length === 0 && <p className="text-center text-slate-300 text-[10px] font-black py-4 italic">No records</p>}
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
