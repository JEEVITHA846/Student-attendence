import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  LogOut,
  History,
  Sparkles,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  onLogoutRequest: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userName, onLogoutRequest }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Tracking', icon: CalendarCheck },
    { id: 'history', label: 'Work History', icon: History },
    { id: 'leads', label: 'Lead Desk', icon: Briefcase },
    { id: 'students', label: 'Students', icon: Users },
  ];

  const toolItems = [
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 bg-[#0f172a] h-screen text-white flex flex-col z-50 shadow-2xl">
      <div className="p-8 pb-10 flex items-center">
        <span className="text-2xl font-extrabold tracking-tight text-white select-none">Academix</span>
      </div>

      <nav className="flex-1 px-4 mt-2 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <p className="px-4 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="font-bold flex-1 text-left text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-4 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">System</p>
          <ul className="space-y-1">
            {toolItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold flex-1 text-left text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="mb-4 bg-slate-900/50 rounded-2xl p-3 border border-slate-800/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
            {getInitials(userName || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-tight">{userName || 'Administrator'}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">System Admin</p>
          </div>
          <ChevronRight size={14} className="text-slate-700" />
        </div>

        <button 
          onClick={onLogoutRequest}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-400 transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;