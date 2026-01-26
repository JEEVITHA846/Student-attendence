import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Calendar as CalendarIcon,
  ExternalLink,
  MessageSquarePlus,
  ArrowRight,
  Sparkles,
  XCircle,
  X,
  Briefcase,
  User,
  GraduationCap
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { generateLeadFollowup } from '../services/geminiService';
import { ELECTIVES } from '../constants';

interface LeadsProps {
  leads: Lead[];
  onAdd: (lead: Omit<Lead, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
}

const Leads: React.FC<LeadsProps> = ({ leads, onAdd, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({
    name: '',
    phone: '',
    course: ELECTIVES[0],
    status: LeadStatus.NEW,
    next_follow_up: new Date().toISOString().split('T')[0],
    notes: [] as string[]
  });

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'bg-blue-50 text-blue-600 border-blue-100';
      case LeadStatus.CONTACTED: return 'bg-amber-50 text-amber-600 border-amber-100';
      case LeadStatus.CONVERTED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newLead);
    setIsModalOpen(false);
    setNewLead({
      name: '',
      phone: '',
      course: ELECTIVES[0],
      status: LeadStatus.NEW,
      next_follow_up: new Date().toISOString().split('T')[0],
      notes: []
    });
  };

  const handleGenFollowup = async (lead: Lead) => {
    setAiLoading(lead.id);
    try {
      // Mocking AI response if API key is not yet set
      const msg = await generateLeadFollowup(lead);
      setAiMessage(msg || `Hi ${lead.name}, thank you for inquiring about our ${lead.course} program. We'd love to schedule a quick call to discuss your career goals. Let us know when you're free!`);
    } catch (e) {
      setAiMessage(`Hi ${lead.name}, following up on your ${lead.course} interest. How can we help?`);
    } finally {
      setAiLoading(null);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 pb-32 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Lead Desk</h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm lg:text-base tracking-tight">Track student inquiries & conversion funnel</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus size={20} />
          New Enquiry
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter leads by name, course or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-4 outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-bold text-slate-700"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-black hover:bg-slate-50 transition-colors shadow-sm text-sm">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
            <div className="p-8 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl border border-indigo-100/50">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{lead.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{lead.course}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <Phone size={16} />
                  <span className="text-xs font-black">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <CalendarIcon size={16} />
                  <span className="text-xs font-black">Next: {lead.next_follow_up}</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/30">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Briefcase size={12} /> Recent Note
                </p>
                <p className="text-xs text-slate-600 font-semibold line-clamp-2 italic leading-relaxed">
                  "{lead.notes.length > 0 ? lead.notes[0] : "No activity logged yet."}"
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 flex gap-2 border-t border-slate-50">
              <button 
                onClick={() => handleGenFollowup(lead)}
                disabled={!!aiLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 shadow-sm"
              >
                {aiLoading === lead.id ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <Sparkles size={14} className="text-indigo-500" />
                )}
                AI Magic
              </button>
              <button className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95 transition-all">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                  <Briefcase size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight">New Student Inquiry</h3>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">Capture admission leads</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 lg:p-12 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <User size={14} className="text-indigo-500" /> Lead Name
                </label>
                <input 
                  type="text" required value={newLead.name}
                  onChange={e => setNewLead({...newLead, name: e.target.value})}
                  placeholder="e.g. Michael Scott"
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black text-slate-700 outline-none ring-4 ring-transparent focus:ring-indigo-500/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Phone size={14} className="text-indigo-500" /> Verified Mobile
                  </label>
                  <input 
                    type="tel" required value={newLead.phone}
                    onChange={e => setNewLead({...newLead, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black text-slate-700 outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <GraduationCap size={14} className="text-indigo-500" /> Target Course
                  </label>
                  <select 
                    value={newLead.course}
                    onChange={e => setNewLead({...newLead, course: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black text-slate-700 outline-none cursor-pointer"
                  >
                    {ELECTIVES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 shrink-0">
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Create Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {aiMessage && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl"><Sparkles size={24} /></div>
                <h3 className="text-xl font-black tracking-tight">AI Message Draft</h3>
              </div>
              <button onClick={() => setAiMessage(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-10">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                <p className="text-slate-700 leading-relaxed text-sm font-semibold italic">"{aiMessage}"</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiMessage || '');
                    setAiMessage(null);
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95"
                >
                  Copy to Clipboard
                </button>
                <button 
                  onClick={() => setAiMessage(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;