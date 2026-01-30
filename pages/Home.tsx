
import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Check, 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Shield, 
  Users, 
  BarChart3, 
  Mail,
  User,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface HomeProps {
  initialView?: 'auth' | 'forgot-password' | 'update-password';
  onCompleteRecovery?: () => void;
}

type AuthTab = 'login' | 'signup';
type ViewState = 'auth' | 'forgot-password' | 'update-password';

const Home: React.FC<HomeProps> = ({ initialView = 'auth', onCompleteRecovery }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<ViewState>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync with initialView prop if it changes
  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleHeaderAction = (tab: AuthTab) => {
    setActiveTab(tab);
    setView('auth');
    setError('');
    setSuccessMsg('');
    scrollToId('hero');
    
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 600);
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
            setSuccessMsg('A password reset link has been sent to your email. Please check your inbox.');
        } else if (view === 'update-password') {
            if (newPassword.length < 6) {
                setError('Password must be at least 6 characters');
                setIsLoading(false);
                return;
            }
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setSuccessMsg('Your password has been updated successfully.');
            
            setTimeout(() => {
                if (onCompleteRecovery) {
                    onCompleteRecovery();
                }
                setView('auth');
                setActiveTab('login');
                setSuccessMsg('');
            }, 2500);
        } else if (activeTab === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else {
            if (!name.trim() || !email.trim() || !password) {
                setError('All fields are required'); 
                setIsLoading(false);
                return;
            }
            if (!acceptedTerms) {
                setError('Please accept the terms and conditions'); 
                setIsLoading(false);
                return;
            }
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: name } },
            });
            if (error) throw error;
            setSuccessMsg('Please check your email to verify your account.');
        }
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  const NavLink = ({ children, targetId }: { children?: React.ReactNode; targetId: string }) => (
    <button 
      onClick={() => scrollToId(targetId)}
      className="text-[#4B5563] hover:text-[#000000] font-semibold text-sm transition-colors px-3 py-2 outline-none"
    >
      {children}
    </button>
  );

  const Logo = () => (
    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 select-none">
      <span className="text-white font-black text-xl leading-none">A</span>
    </div>
  );

  const inputClasses = "w-full px-5 py-3.5 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-black transition-all text-sm font-medium text-black placeholder:text-[#9CA3AF] [appearance:none] autofill:bg-white autofill:shadow-[0_0_0_30px_white_inset]";

  return (
    <div className="min-h-screen bg-white font-['Inter'] selection:bg-black selection:text-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo />
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
            <NavLink targetId="features">Features</NavLink>
            <NavLink targetId="ai">AI Insights</NavLink>
            <NavLink targetId="how-it-works">How it works</NavLink>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={() => handleHeaderAction('login')}
              className="px-3 sm:px-6 py-2 border border-[#E5E7EB] text-black font-bold text-[11px] sm:text-sm rounded-lg hover:bg-[#F9FAFB] transition-all outline-none whitespace-nowrap"
            >
              Login
            </button>
            <button 
              onClick={() => handleHeaderAction('signup')}
              className="px-3 sm:px-6 py-2 bg-black text-white font-bold text-[11px] sm:text-sm rounded-lg hover:bg-[#111827] transition-all outline-none whitespace-nowrap"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <section id="hero" className="pt-40 pb-24 px-6 max-w-7xl mx-auto overflow-hidden text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full">
              <Zap size={14} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Intelligent Education SaaS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black leading-[1.1] tracking-tight">
              Manage student <br />
              <span className="text-[#9CA3AF]">intelligence</span> with <br />
              zero friction.
            </h1>
            <p className="text-lg text-[#4B5563] max-w-lg leading-relaxed font-medium">
              The next generation of attendance tracking and student management. 
              Powered by AI to give you insights that matter, right when you need them.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-700">
            <div className="w-full max-w-[440px] bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="p-8 md:p-10">
                {view === 'auth' ? (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-4xl font-bold text-black tracking-tight mb-2">
                        {activeTab === 'login' ? 'Login' : 'Sign Up'}
                      </h2>
                      <p className="text-[#9CA3AF] text-sm font-medium">
                        {activeTab === 'login' ? 'Sign into your account' : 'Create your account'}
                      </p>
                    </div>

                    <div className="flex border-b border-[#E5E7EB] mb-8">
                      <button 
                        onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
                        className={`flex-1 pb-4 text-sm font-bold transition-all relative outline-none ${
                          activeTab === 'login' ? 'text-black' : 'text-[#9CA3AF] hover:text-[#4B5563]'
                        }`}
                      >
                        Login
                        {activeTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('signup'); setError(''); setSuccessMsg(''); }}
                        className={`flex-1 pb-4 text-sm font-bold transition-all relative outline-none ${
                          activeTab === 'signup' ? 'text-black' : 'text-[#9CA3AF] hover:text-[#4B5563]'
                        }`}
                      >
                        Sign Up
                        {activeTab === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {activeTab === 'signup' && (
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-bold text-black ml-1">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClasses}
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-black ml-1">Email Address</label>
                        <input 
                          ref={emailInputRef}
                          type="email" 
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClasses}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[13px] font-bold text-black">Password</label>
                        </div>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClasses}
                            disabled={isLoading}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors outline-none"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {successMsg && (
                          <div className="animate-in fade-in duration-200">
                              <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">{successMsg}</p>
                          </div>
                      )}
                      {error && (
                        <div className="animate-in fade-in duration-200">
                          <p className="text-[11px] font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 px-1">
                        {activeTab === 'login' ? (
                          <>
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  className="sr-only" 
                                />
                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                                  rememberMe ? 'bg-black border-black' : 'bg-white border-[#E5E7EB]'
                                }`}>
                                  {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                              </div>
                              <span className="text-[11px] font-black text-[#9ca3af] uppercase tracking-widest leading-none">Remember me</span>
                            </label>
                            <button 
                              type="button" 
                              onClick={() => { setView('forgot-password'); setError(''); setSuccessMsg(''); }}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-500 leading-none outline-none"
                            >
                              Forgot password?
                            </button>
                          </>
                        ) : (
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input 
                                type="checkbox" 
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="sr-only" 
                              />
                              <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                                acceptedTerms ? 'bg-black border-black' : 'bg-white border-[#E5E7EB]'
                              }`}>
                                {acceptedTerms && <Check size={12} className="text-white" strokeWidth={4} />}
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-[#4B5563]">I accept all terms & conditions</span>
                          </label>
                        )}
                      </div>

                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-[#111827] transition-all active:scale-[0.98] mt-4 shadow-lg shadow-black/5 outline-none flex items-center justify-center gap-2"
                      >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {activeTab === 'login' ? 'Login' : 'Sign Up'}
                      </button>
                    </form>
                  </>
                ) : view === 'forgot-password' ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button 
                      onClick={() => setView('auth')}
                      className="flex items-center gap-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-6 hover:text-black transition-colors outline-none"
                    >
                      <ArrowLeft size={14} /> Back to login
                    </button>
                    <h2 className="text-4xl font-bold text-black tracking-tight mb-2 text-center">Reset Password</h2>
                    <p className="text-sm text-[#4B5563] font-medium mb-8 leading-relaxed text-center">Enter your email and we'll send a reset link.</p>
                    
                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-black ml-1">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClasses}
                          disabled={isLoading}
                        />
                      </div>
                      {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
                      {successMsg && (
                        <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
                           <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                             <Check size={12} className="text-white" />
                           </div>
                           <p className="text-[11px] font-bold text-emerald-600">{successMsg}</p>
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-[#111827] transition-all active:scale-[0.98] outline-none flex items-center justify-center gap-2"
                      >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        Send Reset Link
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-400">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
                        <KeyRound size={32} />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-black tracking-tight mb-2 text-center">New Password</h2>
                    <p className="text-sm text-[#4B5563] font-medium mb-8 leading-relaxed text-center">Set a secure password for your account.</p>
                    
                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-black ml-1">Choose Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClasses}
                            disabled={isLoading}
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors outline-none"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="bg-rose-50 p-4 border border-rose-100 rounded-xl flex items-center gap-3">
                           <AlertCircle size={18} className="text-rose-500" />
                           <p className="text-[11px] font-bold text-rose-600">{error}</p>
                        </div>
                      )}
                      {successMsg && (
                        <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-xl flex items-center gap-3">
                           <Check size={18} className="text-emerald-500" />
                           <p className="text-[11px] font-bold text-emerald-600">{successMsg}</p>
                        </div>
                      )}
                      
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-[#111827] transition-all active:scale-[0.98] outline-none flex items-center justify-center gap-2"
                      >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        Update Password
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <h2 className="text-4xl font-bold text-black tracking-tight mb-4 text-left">Built for scale. <br />Designed for simplicity.</h2>
            <p className="text-[#4B5563] font-medium leading-relaxed text-left">Everything you need to manage your institution in one clean interface without the complexity of legacy systems.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: 'Smart Attendance', desc: 'automated tracking with intuitive status toggles and batch marking features.', icon: <Users size={24} /> },
              { title: 'Lead Funnel', desc: 'Track admissions and student inquiries with status-based follow-ups and CRM tools.', icon: <BarChart3 size={24} /> },
              { title: 'Data Security', desc: 'Enterprise-grade security and encryption for your sensitive institutional data.', icon: <Shield size={24} /> }
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 hover:border-black transition-all group cursor-default">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-sm text-[#9CA3AF] font-medium leading-relaxed uppercase tracking-tight">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="py-24 bg-[#F9FAFB] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h2 className="text-4xl font-bold text-black tracking-tight mb-8">AI Intelligence at your fingertips.</h2>
            <ul className="space-y-6">
              {[
                'Predictive attendance trends and student alerts',
                'Automated daily summary and report generations',
                'Natural language student query processing engine',
                'Deep behavioral insights and administrative reporting'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={4} className="text-black" />
                  </div>
                  <span className="text-lg font-bold text-[#4B5563] tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-8">
                <Sparkles size={32} />
             </div>
             <p className="text-sm font-bold text-black uppercase tracking-[0.2em] mb-4">Processing Engine</p>
             <div className="space-y-3 w-full max-w-xs">
                <div className="h-2 w-full bg-[#F9FAFB] rounded-full overflow-hidden">
                  <div className="h-full bg-black w-2/3 animate-pulse"></div>
                </div>
                <div className="h-2 w-3/4 bg-[#F9FAFB] mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-black w-1/2 animate-pulse [animation-delay:0.2s]"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold text-black tracking-tight">Three steps to clarity.</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-[#E5E7EB] z-0"></div>
          {[
            { step: '01', title: 'Onboard', desc: 'Import student lists or add them manually in seconds.' },
            { step: '02', title: 'Track', desc: 'Log daily attendance sessions across any device or location.' },
            { step: '03', title: 'Analyze', desc: 'Get AI-powered reports and act on real-time data flow.' }
          ].map((item, i) => (
            <div key={i} className="relative z-10 space-y-6 text-center">
              <div className="w-20 h-20 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-sm text-[#9ca3af] font-bold leading-relaxed px-4">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 bg-[#F9FAFB] border-t border-[#E5E7EB] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
            </div>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest leading-relaxed">
              © 2025 Education Systems.<br />
              Premium SaaS Management.
            </p>
          </div>
          <div className="flex gap-16 text-left items-start">
            <div className="space-y-4 text-left">
              <p className="text-[10px] font-black text-black uppercase tracking-widest text-left">Product</p>
              <ul className="space-y-2 p-0 m-0 list-none text-left">
                <li><button onClick={() => scrollToId('features')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">Features</button></li>
                <li><button onClick={() => scrollToId('features')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">Pricing</button></li>
                <li><button onClick={() => scrollToId('ai')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">Intelligence</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
