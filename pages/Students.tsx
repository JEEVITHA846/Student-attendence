
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  X,
  PieChart,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { DEPARTMENTS } from '../constants';

interface StudentsProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onAdd: (student: Omit<Student, 'id' | 'attendancePercentage'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const Students: React.FC<StudentsProps> = ({ students, attendance, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
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

  const studentStats = useMemo(() => {
    return students.map(student => {
      const studentAttendance = attendance.filter(a => a.student_id === student.id);
      const totalSessions = new Set(attendance.map(a => `${a.date}-${a.timestamp}`)).size;
      const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

      return {
        ...student,
        calculatedPercentage: percentage
      };
    });
  }, [students, attendance]);

  const handleEditClick = (student: Student) => {
    setFormError(null);
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
    setFormError(null);
    setEditingStudentId(null);
    setFormData({ name: '', roll_no: '', department: DEPARTMENTS[0], year: 1, status: 'Active' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingStudentId) {
        await onUpdate(editingStudentId, formData);
      } else {
        await onAdd(formData);
      }
      setIsModalOpen(false);
      setEditingStudentId(null);
    } catch (err: any) {
      setFormError(err.message || "Failed to save student record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Robust null-safe filter to prevent crashes if database has null values
  const filteredStudents = studentStats.filter(s => {
    const search = searchTerm.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const roll = (s.roll_no || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();
    return name.includes(search) || roll.includes(search) || dept.includes(search);
  });

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
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
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
                        {student.name ? student.name.charAt(0) : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm leading-tight truncate">{student.name || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{student.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg tracking-widest">{student.roll_no}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className={`text-[11px] font-black ${student.calculatedPercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {student.calculatedPercentage}%
                       </span>
                       <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${student.calculatedPercentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${student.calculatedPercentage}%` }}
                          />
                       </div>
                    </div>
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
                    {student.name ? student.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{student.name || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.department}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-[11px] font-black ${student.calculatedPercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {student.calculatedPercentage}% Att.
                   </p>
                </div>
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
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/10"
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-transform mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                {editingStudentId ? 'Update Record' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
