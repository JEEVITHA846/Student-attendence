import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import HistoryPage from './pages/History';
import AIAssistant from './pages/AIAssistant';
import Home from './pages/Home';
import { Student, AttendanceRecord } from './types';
import { Menu, AlertTriangle, Loader2 } from 'lucide-react';

import { supabase } from './services/supabaseClient';
import { StudentAPI, AttendanceAPI } from './services/apiService';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [editingSessionData, setEditingSessionData] = useState<{
    date: string,
    timestamp: string,
    records: AttendanceRecord[]
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserName(session?.user?.user_metadata?.full_name || session?.user?.email || '');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserName(session?.user?.user_metadata?.full_name || session?.user?.email || '');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const [studentsData, attendanceData] = await Promise.all([
            StudentAPI.getAll(),
            AttendanceAPI.getAll(),
          ]);
          setStudents(studentsData || []);
          setAttendanceRecords(attendanceData || []);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        }
      };
      fetchData();
    } else {
      setStudents([]);
      setAttendanceRecords([]);
    }
  }, [session]);

  const handleSaveAttendance = async (newRecords: Omit<AttendanceRecord, 'id'>[]) => {
    try {
      if (editingSessionData) {
        await AttendanceAPI.deleteSession(editingSessionData.date, editingSessionData.timestamp);
        setEditingSessionData(null);
      }
      const savedRecords = await AttendanceAPI.saveBatch(newRecords);
      const freshRecords = await AttendanceAPI.getAll();
      setAttendanceRecords(freshRecords);
    } catch (error) {
      console.error("Failed to save attendance:", error);
    }
  };

  const handleDeleteFolder = async (date: string) => {
    await AttendanceAPI.deleteFolder(date);
    setAttendanceRecords(prev => prev.filter(r => r.date !== date));
  };

  const handleDeleteSession = async (date: string, timestamp: string) => {
    await AttendanceAPI.deleteSession(date, timestamp);
    setAttendanceRecords(prev => prev.filter(r => !(r.date === date && r.timestamp === timestamp)));
  };

  const handleEditSession = (date: string, timestamp: string) => {
    const sessionRecords = attendanceRecords.filter(r => r.date === date && r.timestamp === timestamp);
    if (sessionRecords.length > 0) {
      setEditingSessionData({ date, timestamp, records: sessionRecords });
      setActiveTab('attendance');
    }
  };

  const handleAddStudent = async (student: Omit<Student, 'id' | 'attendancePercentage'>) => {
    const newStudent = await StudentAPI.create(student);
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    const updatedStudent = await StudentAPI.update(id, updates);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedStudent } : s));
  };

  const handleDeleteStudent = async (id: string) => {
    await AttendanceAPI.deleteByStudentId(id);
    await StudentAPI.delete(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Home />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          students={students} 
          attendance={attendanceRecords} 
          onTakeAttendance={() => setActiveTab('attendance')}
          onViewHistory={() => setActiveTab('history')}
          userName={userName}
        />;
      case 'attendance':
        return <Attendance 
          students={students} 
          onSave={handleSaveAttendance} 
          editModeData={editingSessionData || undefined}
        />;
      case 'history':
        return <HistoryPage 
          records={attendanceRecords} 
          students={students} 
          onDeleteFolder={handleDeleteFolder}
          onDeleteSession={handleDeleteSession}
          onEditSession={handleEditSession}
        />;
      case 'students':
        return <Students 
          students={students} 
          onAdd={handleAddStudent} 
          onUpdate={handleUpdateStudent}
          onDelete={handleDeleteStudent} 
        />;
      case 'ai':
        return <AIAssistant students={students} attendance={attendanceRecords} />;
      default:
        return <Dashboard 
          students={students} 
          attendance={attendanceRecords} 
          onTakeAttendance={() => setActiveTab('attendance')} 
          onViewHistory={() => setActiveTab('history')}
          userName={userName}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-[70] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab !== 'attendance') setEditingSessionData(null);
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          userName={userName}
          onLogoutRequest={() => setShowLogoutConfirm(true)}
        />
      </div>
      <main className="flex-1 lg:ml-64 flex flex-col h-screen bg-[#f1f5f9] relative overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl active:scale-90 transition-transform flex items-center justify-center"
            >
              <Menu size={22} />
            </button>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">Academix</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-7xl mx-auto px-6 py-8 lg:px-10 lg:py-12">
            {renderContent()}
          </div>
        </div>
      </main>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-[360px] rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Sign out?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">You will be returned to the login page.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;