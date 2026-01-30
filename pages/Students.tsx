
import React, { useState, useRef } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  X,
  FileUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Student } from '../types';
import { DEPARTMENTS } from '../constants';

interface StudentsProps {
  students: Student[];
  onAdd: (student: Omit<Student, 'id' | 'attendancePercentage'>) => void;
  onUpdate: (id: string, updates: Partial<Student>) => void;
  onDelete: (id: string) => void;
  onImport: (students: Omit<Student, 'id' | 'attendancePercentage'>[]) => void;
}

const Students: React.FC<StudentsProps> = ({ students, onAdd, onUpdate, onDelete, onImport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importData, setImportData] = useState<Omit<Student, 'id' | 'attendancePercentage'>[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    name: string;
    roll_no: string;
    department: string;
    year: number;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    roll_no: '',
    department: DEPARTMENTS[0],
    year: 1,
    status: 'Active'
  });

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name,
      roll_no: student.roll_no,
      department: student.department,
      year: student.year,
      status: student.status as 'Active' | 'Inactive'
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingStudentId(null);
    setFormData({ name: '', roll_no: '', department: DEPARTMENTS[0], year: 1, status: 'Active' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentId) {
      onUpdate(editingStudentId, formData);
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
    setEditingStudentId(null);
    setFormData({ name: '', roll_no: '', department: DEPARTMENTS[0], year: 1, status: 'Active' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n');
      const parsedData: Omit<Student, 'id' | 'attendancePercentage'>[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
          parsedData.push({
            name: cols[0],
            roll_no: cols[1],
            department: cols[2] || DEPARTMENTS[0],
            year: parseInt(cols[3]) || 1,
            status: 'Active'
          });
        }
      }

      if (parsedData.length > 0) {
        setImportData(parsedData);
        setIsPreviewModalOpen(true);
      } else {
        alert("No valid data found in CSV. Use format: name, roll_no, department, year");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    onImport(importData);
    setIsPreviewModalOpen(false);
    setImportData([]);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-10 bg-blue-600 rounded-full hidden md:block"></div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Directory</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Global Student Records</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <button 
            onClick={handleImportClick}
            className="flex-1 md:flex-none px-6 h-[56px] bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap"
          >
            <FileUp size={20} className="text-blue-500" />
            Import CSV
          </button>
          <button 
            onClick={handleAddClick}
            className="flex-1 md:flex-none px-8 h-[56px] bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-blue-700 whitespace-nowrap"
          >
            <UserPlus size={20} />
            Add Student
          </button>
        </div>
      </div>

      <div className="relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, roll no or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-8 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
          />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Reference ID</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase shadow-sm shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm leading-tight truncate">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{student.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg tracking-widest">{student.roll_no}</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Student"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(student.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No students found.</div>
          )}
        </div>

        <div className="md:hidden divide-y divide-slate-50">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{student.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.department}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-black text-slate-400 tracking-widest">{student.roll_no}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(student)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(student.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {editingStudentId ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                  <input 
                    required
                    type="text" 
                    value={formData.roll_no}
                    onChange={e => setFormData({ ...formData, roll_no: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-transform mt-4">
                {editingStudentId ? 'Update Record' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">CSV Preview</h2>
              <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <AlertCircle size={20} />
                <p className="text-xs font-bold">Found {importData.length} students. Review before importing.</p>
              </div>
              <div className="divide-y divide-slate-50">
                {importData.map((s, i) => (
                  <div key={i} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department} • {s.roll_no}</p>
                    </div>
                    <CheckCircle size={18} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 flex gap-4">
               <button onClick={() => setIsPreviewModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>
               <button onClick={confirmImport} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">Confirm Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
