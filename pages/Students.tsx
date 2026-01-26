import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  X,
} from 'lucide-react';
import { Student } from '../types';
import { DEPARTMENTS } from '../constants';

interface StudentsProps {
  students: Student[];
  onAdd: (student: Omit<Student, 'id' | 'attendancePercentage'>) => void;
  onUpdate: (id: string, updates: Partial<Student>) => void;
  onDelete: (id: string) => void;
}

const Students: React.FC<StudentsProps> = ({ students, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      status: student.status
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

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Directory</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Student Records</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <UserPlus size={20} />
          Add Student
        </button>
      </div>

      <div className="relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, roll no or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-50 rounded-[1.5rem] py-5 pl-16 pr-8 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
          />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
        {/* Desktop Table */}
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
                <tr key={student.id} className="hover:bg-slate-50/30 transition-all group">
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
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Student"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(student.id)} 
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-sm leading-tight truncate">{student.name}</p>
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
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg tracking-widest">{student.roll_no}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(student)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => onDelete(student.id)} 
                    className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">Directory is currently empty.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl">
                  {editingStudentId ? <Edit3 size={32} /> : <UserPlus size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none">
                    {editingStudentId ? 'Update Student' : 'Enroll Student'}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Official Registry Entry</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors shrink-0">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Roll / Register ID</label>
                  <input 
                    type="text" required value={formData.roll_no}
                    onChange={e => setFormData({...formData, roll_no: e.target.value})}
                    placeholder="e.g. REG-401"
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department Assigned</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none cursor-pointer appearance-none"
                  >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lifecycle Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none cursor-pointer appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className={`w-full py-6 text-white rounded-[1.5rem] font-black text-base shadow-xl active:scale-95 transition-all mt-4 ${editingStudentId ? 'bg-indigo-600' : 'bg-blue-600'}`}
              >
                {editingStudentId ? 'Save Changes' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;