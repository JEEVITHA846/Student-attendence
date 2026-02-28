
import React, { useMemo } from 'react';
import { 
  ArrowRight,
  CalendarDays,
  Tag,
  Users,
  PieChart,
  LayoutGrid
} from 'lucide-react';
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
    const today = new Date().toLocaleDateString('en-CA'); 
    const todaysAttendance = attendance.filter(a => a.date === today);
    
    // Global Stats Calculation
    const latestStatusPerStudent: Record<string, string> = {};
    todaysAttendance.forEach(a => {
      latestStatusPerStudent[a.student_id] = a.status;
    });

    const statusValues = Object.values(latestStatusPerStudent);
    const presentToday = statusValues.filter(s => s === 'Present').length;
    const absentToday = statusValues.filter(s => s === 'Absent').length;
    const odToday = statusValues.filter(s => s === 'OD').length;

    // Department-wise Stats Calculation
    const deptStats = DEPARTMENTS.map(dept => {
      const deptStudents = students.filter(s => s.department === dept);
      const deptStudentIds = new Set(deptStudents.map(s => s.id));
      
      const deptAttendance = todaysAttendance.filter(a => deptStudentIds.has(a.student_id));
      
      const deptStatusMap: Record<string, string> = {};
      deptAttendance.forEach(a => {
        deptStatusMap[a.student_id] = a.status;
      });

      const values = Object.values(deptStatusMap);
      return {
        name: dept,
        present: values.filter(s => s === 'Present').length,
        absent: values.filter(s => s === 'Absent').length,
        od: values.filter(s => s === 'OD').length,
        total: deptStudents.length,
        percentage: values.length > 0 ? Math.round((values.filter(s => s === 'Present').length / values.length) * 100) : 0
      };
    });

    // Recent Sessions
    const sessionMap = new Map<string, AttendanceRecord>();
    const sortedAttendance = [...attendance].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.timestamp.localeCompare(a.timestamp);
    });

    sortedAttendance.forEach(rec => {
      const key = `${rec.date}-${rec.timestamp}`;
      if (!sessionMap.has(key)) {
        sessionMap.set(key, rec);
      }
    });
    
    const recentSessions = Array.from(sessionMap.values()).slice(0, 5);

    return {
      totalStudents: students.length,
      attendancePercentage: statusValues.length > 0 
        ? Math.round((presentToday / statusValues.length) * 100) 
        : 0,
      presentToday,
      absentToday,
      odToday,
      deptStats,
      recentSessions
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
    <div className="animate-in fade-in duration-700 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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

      {/* Global Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#eefdf5] p-8 rounded-[2rem] border border-[#dcfce7] shadow-sm flex flex-col items-center justify-center">
          <p className="text-5xl font-black text-[#10b981] mb-2">{stats.presentToday}</p>
          <p className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-[0.2em]">Present Today</p>
        </div>
        
        <div className="bg-[#fff1f2] p-8 rounded-[2rem] border border-[#ffe4e6] shadow-sm flex flex-col items-center justify-center">
          <p className="text-5xl font-black text-[#f43f5e] mb-2">{stats.absentToday}</p>
          <p className="text-[10px] font-extrabold text-[#f43f5e] uppercase tracking-[0.2em]">Absent Today</p>
        </div>
        
        <div className="bg-[#ecfeff] p-8 rounded-[2rem] border border-[#cffafe] shadow-sm flex flex-col items-center justify-center">
          <p className="text-5xl font-black text-[#0891b2] mb-2">{stats.odToday}</p>
          <p className="text-[10px] font-extrabold text-[#0891b2] uppercase tracking-[0.2em]">On Duty (O.D.)</p>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <LayoutGrid size={20} className="text-slate-400" />
           <h2 className="text-lg font-black text-slate-900 tracking-tight">Department Breakdown</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stats.deptStats.map((dept) => (
            <div key={dept.name} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase">
                    {dept.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none">{dept.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{dept.total} Total Students</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-blue-600">{dept.percentage}%</p>
                   <div className="w-12 h-1.5 bg-slate-50 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100/50">
                  <p className="text-lg font-black text-emerald-600 leading-none">{dept.present}</p>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter mt-1.5">P</p>
                </div>
                <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-100/50">
                  <p className="text-lg font-black text-rose-600 leading-none">{dept.absent}</p>
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter mt-1.5">A</p>
                </div>
                <div className="bg-cyan-50 rounded-2xl p-4 text-center border border-cyan-100/50">
                  <p className="text-lg font-black text-cyan-600 leading-none">{dept.od}</p>
                  <p className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter mt-1.5">OD</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Sessions</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recently committed batch logs</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest self-start sm:self-center">
              {stats.attendancePercentage}% Today's Rate
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            {stats.recentSessions.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {stats.recentSessions.map((rec, i) => {
                  return (
                    <div key={`${rec.date}-${rec.timestamp}-${i}`} className="flex items-center justify-between py-6 group hover:bg-slate-50/50 px-4 rounded-2xl transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                           <Tag size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">
                            {rec.subject || 'Quick Log'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {rec.date} • {rec.timestamp}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={onViewHistory}
                        className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <Tag size={32} />
                </div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No activity found in logs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
