
import React, { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  X,
  ClipboardList,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { DayNote } from '../types';

interface DayNotesProps {
  notes: DayNote[];
  onAdd: (note: Omit<DayNote, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const DayNotes: React.FC<DayNotesProps> = ({ notes, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onAdd({ date, reason });
      setIsModalOpen(false);
      setReason('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save note. Ensure table exists in Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setError(null);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Day Notes</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Log Non-Attendance Reasons</p>
          </div>
        </div>
        <button 
          onClick={handleOpenModal}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} />
          Add Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length > 0 ? notes.map((note) => (
          <div key={note.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">{note.date}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Special Event</p>
              </div>
            </div>
            
            <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">
              "{note.reason}"
            </p>

            <button 
              onClick={() => onDelete(note.id)}
              className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
            <ClipboardList size={48} className="text-slate-100" />
            <div>
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No day notes recorded</p>
              <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mt-1">Record reasons for empty attendance logs</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Day Note</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for no attendance</label>
                <textarea 
                  required
                  placeholder="e.g. Pongal Festival, Local Holiday, Sports Day..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none min-h-[120px]"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayNotes;
