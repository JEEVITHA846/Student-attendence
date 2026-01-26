import React, { useMemo } from 'react';
import { 
  Users, 
  Search,
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { Student, AttendanceRecord } from '../types';
import { DEPARTMENTS } from '../constants';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onTakeAttendance: () => void;
  onViewHistory: () => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance, onViewHistory, userName }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendance.filter(a => a.date === today);
    
    const latestStatusPerStudent: Record<string, string> = {};
    todaysAttendance.forEach(a => {
      latestStatusPerStudent[a.student_id] = a.status;
    });

    const statusValues = Object.values(latestStatusPerStudent);
    const presentToday = statusValues.filter(s => s === 'Present').length;
    const absentToday = statusValues.filter(s => s === 'Absent').length;
    const odToday = statusValues.filter(s => s === 'OD').length;

    const departmentMetrics = DEPARTMENTS.map(dept => {
      const studentsInDept = students.filter(s => s.department === dept);
      const studentIdsInDept = new Set<string>(studentsInDept.map(s => s.id));
      
      let p = 0, a = 0, od = 0;
      studentIdsInDept.forEach((id: string) => {
        const status = latestStatusPerStudent[id];
        if (status === 'Present') p++;
        else if (status === 'Absent') a++;
        else if (status === 'OD') od++;
      });
      
      return {
        name: dept,
        total: studentsInDept.length,
        present: p,
        absent: a,
        od: od,
      };
    });
    
    return {
      totalStudents: students.length,
      attendancePercentage: statusValues.length > 0 
        ? Math.round((presentToday / statusValues.length) * 100) 
        : 0,
      presentToday,
      absentToday,
      odToday,
      departmentMetrics,
      recentActivity: [...attendance].reverse().slice(0, 5)
    };
  }, [students, attendance]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{greeting},</p>
          </div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">{userName || 'Administrator'}</h1>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <CalendarDays size={18} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-600">{formattedDate}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-wider mb-8">Status Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#eefdf5] p-8 rounded-[2rem] border border-[#dcfce7] shadow-sm flex flex-col items-center justify-center">
            <p className="text-4xl font-black text-[#10b981] mb-2">{stats.presentToday}</p>
            <p className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-[0.2em]">Present Today</p>
          </div>
          
          <div className="bg-[#fff1f2] p-8 rounded-[2rem] border border-[#ffe4e6] shadow-sm flex flex-col items-center justify-center">
            <p className="text-4xl font-black text-[#f43f5e] mb-2">{stats.absentToday}</p>
            <p className="text-[10px] font-extrabold text-[#f43f5e] uppercase tracking-[0.2em]">Absent Today</p>
          </div>
          
          <div className="bg-[#ecfeff] p-8 rounded-[2rem] border border-[#cffafe] shadow-sm flex flex-col items-center justify-center">
            <p className="text-4xl font-black text-[#0891b2] mb-2">{stats.odToday}</p>
            <p className="text-[10px] font-extrabold text-[#0891b2] uppercase tracking-[0.2em]">On Duty (O.D.)</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-wider">Departmental Split</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.departmentMetrics.map((dept, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-lg font-black text-[#0f172a] tracking-tight">{dept.name}</h3>
                <p className="text-xs font-bold text-slate-400">{dept.total} Students</p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4 text-center">
                  <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest block">Present</span>
                  <span className="text-xl font-black text-slate-900 block">{dept.present}</span>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="bg-[#10b981] h-full transition-all duration-1000" style={{ width: `${dept.total > 0 ? (dept.present / dept.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-4 text-center">
                  <span className="text-[10px] font-black text-[#f43f5e] uppercase tracking-widest block">Absent</span>
                  <span className="text-xl font-black text-slate-900 block">{dept.absent}</span>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="bg-[#f43f5e] h-full transition-all duration-1000" style={{ width: `${dept.total > 0 ? (dept.absent / dept.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-4 text-center">
                  <span className="text-[10px] font-black text-[#0891b2] uppercase tracking-widest block">O.D.</span>
                  <span className="text-xl font-black text-slate-900 block">{dept.od}</span>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="bg-[#0891b2] h-full transition-all duration-1000" style={{ width: `${dept.total > 0 ? (dept.od / dept.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Logs</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recently committed sessions</p>
          </div>
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest self-start sm:self-center">
            {stats.attendancePercentage}% Weekly Avg
          </div>
        </div>
        
        <div className="space-y-2 overflow-x-auto min-w-full">
          {stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-50 min-w-[600px]">
              {stats.recentActivity.map((rec, i) => {
                const student = students.find(s => s.id === rec.student_id);
                const periods = rec.timestamp.split(' - ')[0]; // Extract P1, P2 etc.
                return (
                  <div key={i} className="flex items-center justify-between py-6 group hover:bg-slate-50/50 px-4 rounded-2xl transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                        rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                        rec.status === 'Absent' ? 'bg-rose-50 text-rose-600' : 'bg-cyan-50 text-cyan-600'
                      }`}>
                        {rec.status === 'Present' ? 'P' : rec.status === 'Absent' ? 'A' : 'OD'}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-tight">{student?.name || 'Unknown Student'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {student?.department} • {periods}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{rec.subject}</p>
                      </div>
                      <button 
                        onClick={onViewHistory}
                        className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No entries available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;