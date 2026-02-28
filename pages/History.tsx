
import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  ChevronRight, 
  FileText, 
  ArrowLeft,
  Trash2,
  Search,
  Clock,
  Edit3,
  Tag,
  MessageSquare,
  StickyNote
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
      const dateKey = r.date || 'Unknown Date';
      if (!folders[dateKey]) folders[dateKey] = [];
      folders[dateKey].push(r);
    });
    return folders;
  }, [records]);

  const sessionsInFolder = useMemo(() => {
    if (!selectedFolder || !dateFolders[selectedFolder]) return {};
    return dateFolders[selectedFolder].reduce((acc: Record<string, AttendanceRecord[]>, curr) => {
      const timeKey = curr.timestamp || 'Unknown Time';
      acc[timeKey] = acc[timeKey] || [];
      acc[timeKey].push(curr);
      return acc;
    }, {});
  }, [selectedFolder, dateFolders]);

  const currentSessionRecords = useMemo(() => {
    if (!selectedFolder || !selectedSession || !sessionsInFolder[selectedSession]) return [];
    return sessionsInFolder[selectedSession];
  }, [selectedFolder, selectedSession, sessionsInFolder]);

  const detailData = useMemo(() => {
    if (!currentSessionRecords.length) return null;
    
    // Check for global remark stored in the first record
    const firstRecordRemark = currentSessionRecords[0]?.remark || '';
    const globalMatch = firstRecordRemark.match(/\[Global Note: (.*?)\]/);
    const sessionGlobalRemark = globalMatch ? globalMatch[1] : null;

    return {
      present: currentSessionRecords.filter(r => r.status === AttendanceStatus.PRESENT),
      absent: currentSessionRecords.filter(r => r.status === AttendanceStatus.ABSENT),
      od: currentSessionRecords.filter(r => r.status === AttendanceStatus.OD),
      sessionName: currentSessionRecords[0]?.subject || 'Untitled Session',
      globalRemark: sessionGlobalRemark
    };
  }, [currentSessionRecords]);

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else {
      setSelectedFolder(null);
    }
  };

  const getCleanRemark = (remark: string) => {
    return remark.replace(/\[Global Note: .*?\]\s*/, '');
  };

  const filteredFolders = Object.keys(dateFolders).sort().reverse().filter(date => 
    date.includes(searchTerm)
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Archives</h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
            {selectedSession ? 'Detailed Log' : selectedFolder ? `Sessions: ${selectedFolder}` : 'Dated Folders'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-xs font-bold border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" 
              />
           </div>
        </div>
      </div>

      {!selectedFolder && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
          {filteredFolders.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                  <Folder size={48} className="text-slate-200" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No entries found</p>
              </div>
          ) : (
              filteredFolders.map(date => {
                  const uniqueSessions = new Set(dateFolders[date].map(r => r.timestamp)).size;
                  return (
                    <div key={date} className="relative group">
                        <button 
                          onClick={() => setSelectedFolder(date)}
                          className="w-full bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all text-left group outline-none"
                        >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Folder size={32} className="fill-blue-600/10" />
                        </div>
                        <p className="text-lg font-black text-slate-900 mb-1 leading-none">{date}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                            {uniqueSessions} Session{uniqueSessions !== 1 ? 's' : ''} stored
                        </p>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteFolder(date); }}
                          className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  );
              })
          )}
        </div>
      )}

      {selectedFolder && !selectedSession && (
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300 mb-24">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest outline-none">
                  <ArrowLeft size={18} /> Back
             </button>
             <h2 className="text-lg font-black text-slate-900">{selectedFolder}</h2>
          </div>
          <div className="p-8 space-y-4">
              {Object.keys(sessionsInFolder).sort().reverse().map(time => {
                const sessionRecords = sessionsInFolder[time];
                const sName = sessionRecords[0]?.subject || 'Quick Log';
                return (
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
                                <p className="text-sm font-black text-slate-900 truncate leading-none">{sName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2.5 flex items-center gap-1.5">
                                  <Clock size={12} /> {time} • {sessionRecords.length} Students
                                </p>
                            </div>
                         </div>
                         <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                    
                    <div className="flex items-center gap-2 pr-2">
                      <button 
                        onClick={() => onEditSession(selectedFolder, time)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteSession(selectedFolder, time)}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {selectedFolder && selectedSession && detailData && (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-300 pb-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm gap-6">
             <div className="flex items-center gap-4 sm:gap-8">
               <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest outline-none">
                    <ArrowLeft size={18} /> Back
               </button>
               <div className="w-px h-5 bg-slate-100 hidden sm:block"></div>
               <button 
                 onClick={() => onEditSession(selectedFolder, selectedSession)}
                 className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest outline-none"
               >
                 <Edit3 size={16} /> Edit
               </button>
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 shadow-inner">
                  <Tag size={16} className="text-blue-600" />
                  <h2 className="text-[11px] font-black text-blue-900 uppercase tracking-tight">{detailData.sessionName}</h2>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                  <Clock size={16} className="text-slate-400" />
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{selectedSession}</h2>
                </div>
             </div>
          </div>

          {/* Session Remark Display */}
          {detailData.globalRemark && (
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/10 flex items-start gap-6 animate-in fade-in zoom-in-95">
              <div className="p-4 bg-white/20 rounded-2xl">
                <StickyNote size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-2">Session Notes</p>
                <p className="text-lg font-bold leading-relaxed">{detailData.globalRemark}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-center">
              <p className="text-5xl font-black text-emerald-600 mb-1">{detailData.present.length}</p>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Present</p>
            </div>
            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center">
              <p className="text-5xl font-black text-rose-600 mb-1">{detailData.absent.length}</p>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Absent</p>
            </div>
            <div className="bg-cyan-50 p-8 rounded-[2.5rem] border border-cyan-100 text-center">
              <p className="text-5xl font-black text-cyan-600 mb-1">{detailData.od.length}</p>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">O.D.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {([
               { title: 'Present', data: detailData.present, color: 'bg-emerald-500', bg: 'bg-slate-50', textColor: 'text-emerald-700' },
               { title: 'Absent', data: detailData.absent, color: 'bg-rose-500', bg: 'bg-rose-50/30', textColor: 'text-rose-700' },
               { title: 'O.D.', data: detailData.od, color: 'bg-cyan-500', bg: 'bg-cyan-50/30', textColor: 'text-cyan-700' }
             ] as const).map((col, idx) => (
               <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8">
                  <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                    {col.title}
                  </h3>
                  <div className="space-y-4">
                    {col.data.map(rec => {
                      const student = students.find(s => s.id === rec.student_id);
                      const cleanRemark = getCleanRemark(rec.remark || '');
                      return (
                        <div key={rec.id} className={`p-5 ${col.bg} rounded-2xl border border-transparent hover:border-slate-100 transition-colors`}>
                          <p className="text-base font-black text-slate-900 leading-tight">{student?.name || 'Unknown'}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">{student?.roll_no || rec.student_id}</p>
                          
                          {cleanRemark && (
                            <div className="mt-4 flex gap-2 items-start bg-white/60 p-3 rounded-xl">
                              <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
                              <p className={`text-[10px] font-bold italic leading-relaxed ${col.textColor}`}>
                                {cleanRemark}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
