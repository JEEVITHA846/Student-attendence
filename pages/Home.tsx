
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Check, 
  ArrowLeft, 
  Zap, 
  Loader2,
  CalendarCheck,
  Shield,
  LayoutGrid,
  Sparkles,
  BarChart3,
  MailCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface HomeProps {
  initialView?: 'auth' | 'forgot-password' | 'update-password';
  onCompleteRecovery?: () => void;
}

type AuthTab = 'login' | 'signup';
type ViewState = 'auth' | 'forgot-password' | 'update-password' | 'email-sent';

const Home: React.FC<HomeProps> = ({ initialView = 'auth', onCompleteRecovery }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<ViewState>(initialView as ViewState);
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialView) {
      setView(initialView as ViewState);
      setError('');
      setSuccessMsg('');
    }
  }, [initialView]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
        if (view === 'forgot-password') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/`,
            });
            if (error) throw error;
            setView('email-sent');
        } else if (view === 'update-password') {
            if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
            if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
            
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            
            setSuccessMsg('Password updated successfully!');
            setTimeout(() => {
                if (onCompleteRecovery) onCompleteRecovery();
                setView('auth');
                setActiveTab('login');
                window.location.hash = '';
            }, 2000);
        } else if (activeTab === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else {
            if (!acceptedTerms) throw new Error('Please accept the terms');
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: name } },
            });
            if (error) throw error;
            
            if (data?.user?.identities?.length === 0) {
              throw new Error('This email is already registered. Try logging in.');
            }
            
            setSuccessMsg('Verification email sent! Please check your inbox.');
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-black transition-all text-[13px] font-medium text-black placeholder:text-[#9CA3AF] [appearance:none] autofill:bg-white";

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-black selection:text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-[100]">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2997/2997495.png" 
                alt="Academix Logo" 
                className="w-7 h-7 invert"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-black hidden sm:block">Academix</span>
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
            <button onClick={() => scrollToId('features')} className="text-[#4B5563] hover:text-black font-semibold text-xs transition-colors">Features</button>
            <button onClick={() => scrollToId('ai')} className="text-[#4B5563] hover:text-black font-semibold text-xs transition-colors">AI Insights</button>
            <button onClick={() => scrollToId('how-it-works')} className="text-[#4B5563] hover:text-black font-semibold text-xs transition-colors">How it works</button>
          </nav>

          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTab('login'); setView('auth'); }} 
              className="hidden sm:block px-6 py-2.5 border border-[#E5E7EB] text-black font-bold text-base rounded-lg hover:bg-[#F9FAFB] transition-all"
            >
              Login
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTab('signup'); setView('auth'); }} 
              className="px-6 py-2.5 bg-black text-white font-bold text-base rounded-lg hover:bg-[#111827] transition-all shadow-lg shadow-black/5"
            >
              Sign Up
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-48 pb-32 px-6 max-w-7xl mx-auto text-center lg:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full"
            >
              <Zap size={12} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B5563]">Intelligent Education SaaS</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-[1.1] tracking-tight"
            >
              Manage student <span className="text-[#9CA3AF]">intelligence</span> with zero friction.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg text-[#4B5563] max-w-xl leading-relaxed font-medium mt-6"
            >
              The next generation of attendance tracking and student management. 
              Powered by AI to give you insights that matter.
            </motion.p>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[380px] bg-white border border-[#E5E7EB] rounded-[2rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
              <div className="p-8 md:p-10">
                {view === 'auth' && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-black text-black tracking-tight mb-1">
                        {activeTab === 'login' ? 'Login' : 'Sign Up'}
                      </h2>
                      <p className="text-[#9CA3AF] text-[12px] font-medium">
                        {activeTab === 'login' ? 'Sign into your account' : 'Create your account'}
                      </p>
                    </div>

                    <div className="flex border-b border-[#E5E7EB] mb-8">
                      <button 
                        onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
                        className={`flex-1 pb-3 text-[11px] font-black transition-all relative ${activeTab === 'login' ? 'text-black' : 'text-[#9CA3AF] hover:text-[#4B5563]'}`}
                      >
                        LOGIN
                        {activeTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('signup'); setError(''); setSuccessMsg(''); }}
                        className={`flex-1 pb-3 text-[11px] font-black transition-all relative ${activeTab === 'signup' ? 'text-black' : 'text-[#9CA3AF] hover:text-[#4B5563]'}`}
                      >
                        SIGN UP
                        {activeTab === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {activeTab === 'signup' && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-black ml-1 uppercase tracking-wider">Full Name</label>
                          <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-black ml-1 uppercase tracking-wider">Email Address</label>
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[11px] font-black text-black uppercase tracking-wider">Password</label>
                        </div>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-1">
                        {activeTab === 'login' ? (
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <div 
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-black border-black' : 'bg-white border-[#E5E7EB]'}`} 
                                onClick={() => setRememberMe(!rememberMe)}
                              >
                                {rememberMe && <Check size={10} className="text-white" strokeWidth={4} />}
                              </div>
                              <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">REMEMBER ME</span>
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setView('forgot-password')} 
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                            >
                              Forgot password?
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <div 
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${acceptedTerms ? 'bg-black border-black' : 'bg-white border-[#E5E7EB]'}`} 
                              onClick={() => setAcceptedTerms(!acceptedTerms)}
                            >
                              {acceptedTerms && <Check size={10} className="text-white" strokeWidth={4} />}
                            </div>
                            <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest leading-tight">I ACCEPT TERMS & CONDITIONS</span>
                          </label>
                        )}
                      </div>

                      {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100">{error}</p>}
                      {successMsg && <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">{successMsg}</p>}

                      <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-black text-white rounded-xl font-black text-[13px] hover:bg-[#111827] transition-all flex items-center justify-center gap-2 mt-2">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : activeTab === 'login' ? 'Login' : 'Create Account'}
                      </button>
                    </form>
                  </>
                )}

                {view === 'forgot-password' && (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setView('auth')} className="flex items-center gap-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-6 hover:text-black transition-colors">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <h2 className="text-2xl font-black text-black tracking-tight mb-1">Reset Password</h2>
                    <p className="text-[12px] text-[#4B5563] font-medium mb-8">Enter your email for a recovery link.</p>
                    <form onSubmit={handleAuthSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-black ml-1 uppercase tracking-wider">Email Address</label>
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                      </div>
                      {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
                      <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-black text-white rounded-xl font-black text-[13px] hover:bg-[#111827] flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                      </button>
                    </form>
                  </div>
                )}

                {view === 'email-sent' && (
                  <div className="text-center animate-in zoom-in-95 duration-500 py-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <MailCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-black tracking-tight mb-2">Email Sent!</h2>
                    <p className="text-[12px] text-[#4B5563] font-medium leading-relaxed mb-8">
                      We've sent a recovery link to <strong>{email}</strong>. Check your inbox soon.
                    </p>
                    <button onClick={() => setView('auth')} className="w-full py-3.5 border border-[#E5E7EB] text-black rounded-xl font-black text-[13px] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                      Return to Login <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {view === 'update-password' && (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-black tracking-tight mb-1">New Password</h2>
                    <p className="text-[12px] text-[#4B5563] font-medium mb-8">Update your security credentials.</p>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-black ml-1 uppercase tracking-wider">New Password</label>
                        <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-black ml-1 uppercase tracking-wider">Confirm Password</label>
                        <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} required />
                      </div>
                      {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
                      {successMsg && <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">{successMsg}</p>}
                      <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-black text-white rounded-xl font-black text-[13px] hover:bg-[#111827] flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#E5E7EB]">
        <div className="mb-16">
          <h2 className="text-3xl font-black text-black tracking-tighter mb-4">Built for scale. <br /> Designed for simplicity.</h2>
          <p className="text-sm text-[#4B5563] font-medium max-w-xs leading-relaxed">Everything you need to manage your institution in one clean interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Smart Attendance', desc: 'AUTOMATED TRACKING WITH INTUITIVE STATUS TOGGLES.', icon: CalendarCheck },
            { title: 'Detailed Analytics', desc: 'GAIN INSIGHT INTO STUDENT PERFORMANCE TRENDS.', icon: BarChart3 },
            { title: 'Data Security', desc: 'ENTERPRISE-GRADE SECURITY FOR YOUR SENSITIVE DATA.', icon: Shield }
          ].map((feature, idx) => (
            <div key={idx} className="bg-[#F9FAFB] p-8 rounded-[1.5rem] border border-[#E5E7EB] hover:shadow-xl transition-all group">
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-black text-black mb-3">{feature.title}</h3>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.15em] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 max-w-7xl mx-auto border-t border-[#E5E7EB]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">A</span>
            </div>
            <p className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">© 2025 EDUCATION SYSTEMS.</p>
          </div>

          <div className="flex gap-16">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-black uppercase tracking-widest">PRODUCT</p>
              <ul className="space-y-1.5">
                <li><button onClick={() => scrollToId('features')} className="text-xs font-semibold text-[#9CA3AF] hover:text-black">Features</button></li>
                <li><button onClick={() => scrollToId('ai')} className="text-xs font-semibold text-[#9CA3AF] hover:text-black">Intelligence</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress {
          animation: progress 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Home;
