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
  ChevronRight,
  Mail,
  User,
  MessageSquare,
  Send
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface HomeProps {}

type AuthTab = 'login' | 'signup';
type ViewState = 'auth' | 'forgot-password';

const Home: React.FC<HomeProps> = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [view, setView] = useState<ViewState>('auth');
  const [showPassword, setShowPassword] = useState(false);
  
  // Refs for UX
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Auth Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Smooth scroll helper
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
    
    // UX: Auto-focus the first field after a slight delay for the scroll
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 600);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) setError(error.message);
        else setSuccessMsg('A password reset link has been sent to your email.');
        return;
    }

    if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        // App.tsx will handle successful login via onAuthStateChange
    } else { // signup
        if (!name.trim() || !email.trim() || !password) {
            setError('All fields are required'); return;
        }
        if (!acceptedTerms) {
            setError('Please accept the terms and conditions'); return;
        }
        const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } },
        });
        if (error) setError(error.message);
        else setSuccessMsg('Please check your email to verify your account.');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSubmitted(true);
      setTimeout(() => setContactSubmitted(false), 5000);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }
  };

  const NavLink = ({ children, targetId }: { children?: React.ReactNode; targetId: string }) => (
    <button 
      onClick={() => scrollToId(targetId)}
      className="text-[#4B5563] hover:text-[#000000] font-medium text-sm transition-colors px-4 py-2 outline-none"
    >
      {children}
    </button>
  );

  const inputClasses = "w-full px-5 py-3.5 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-black transition-all text-sm font-medium text-black placeholder:text-[#9CA3AF] [appearance:none] autofill:bg-white autofill:shadow-[0_0_0_30px_white_inset]";

  return (
    <div className="min-h-screen bg-white font-['Inter'] selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-black tracking-tight">Academix</span>
          </div>

          {/* Navigation - Center */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
            <NavLink targetId="features">Features</NavLink>
            <NavLink targetId="ai">AI Insights</NavLink>
            <NavLink targetId="how-it-works">How it works</NavLink>
            <NavLink targetId="contact-section">Contact</NavLink>
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleHeaderAction('login')}
              className="px-6 py-2.5 border border-[#E5E7EB] text-black font-bold text-sm rounded-lg hover:bg-[#F9FAFB] transition-all outline-none"
            >
              Login
            </button>
            <button 
              onClick={() => handleHeaderAction('signup')}
              className="hidden sm:block px-6 py-2.5 bg-black text-white font-bold text-sm rounded-lg hover:bg-[#111827] transition-all outline-none"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-40 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Heading & Subheading */}
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full">
              <Zap size={14} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4B5563]">Intelligent Education SaaS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-black leading-[1.1] tracking-tight text-left">
              Manage student <br />
              <span className="text-[#9CA3AF]">intelligence</span> with <br />
              zero friction.
            </h1>
            <p className="text-lg text-[#4B5563] max-w-lg leading-relaxed font-medium text-left">
              The next generation of attendance tracking and student management. 
              Powered by AI to give you insights that matter, right when you need them.
            </p>
            <div className="flex items-center gap-6 sm:gap-8 pt-4">
              <div className="text-left space-y-1">
                <p className="text-2xl font-bold text-black">99.9%</p>
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest leading-none">Accuracy</p>
              </div>
              <div className="w-px h-8 bg-[#E5E7EB]"></div>
              <div className="text-left space-y-1">
                <p className="text-2xl font-bold text-black">10k+</p>
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest leading-none">Active Users</p>
              </div>
            </div>
          </div>

          {/* Right: Authentication Card */}
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
                              <span className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest leading-none">Remember me</span>
                            </label>
                            <button 
                              type="button" 
                              onClick={() => { setView('forgot-password'); setError(''); setSuccessMsg(''); }}
                              className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest hover:text-black leading-none outline-none"
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
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-[#111827] transition-all active:scale-[0.98] mt-4 shadow-lg shadow-black/5 outline-none"
                      >
                        {activeTab === 'login' ? 'Login' : 'Sign Up'}
                      </button>
                    </form>
                  </>
                ) : (
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
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-[#111827] transition-all active:scale-[0.98] outline-none"
                      >
                        Send Reset Link
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <h2 className="text-4xl font-bold text-black tracking-tight mb-4 text-left">Built for scale. <br />Designed for simplicity.</h2>
            <p className="text-[#4B5563] font-medium leading-relaxed text-left">Everything you need to manage your institution in one clean interface without the complexity of legacy systems.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Smart Attendance', desc: 'automated tracking with intuitive status toggles and batch marking features.', icon: <Users size={24} /> },
              { title: 'Lead Funnel', desc: 'Track admissions and student inquiries with status-based follow-ups and CRM tools.', icon: <BarChart3 size={24} /> },
              { title: 'Data Security', desc: 'Enterprise-grade security and encryption for your sensitive institutional data.', icon: <Shield size={24} /> }
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 hover:border-black transition-all group cursor-default text-left">
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

      {/* AI Section */}
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

      {/* How it Works */}
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
                <p className="text-sm text-[#9CA3AF] font-bold leading-relaxed px-4">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA & Contact Section */}
      <section id="contact-section" className="py-32 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-10">
            <h2 className="text-5xl font-bold text-black tracking-tight leading-tight">Ready to modernize <br /> your institution?</h2>
          </div>

          <div className="w-full max-w-2xl mx-auto bg-white border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-bold text-black tracking-tight mb-2">Get in touch</h3>
              <p className="text-[#9CA3AF] text-sm font-medium">Have questions? Send us a message and we'll get back to you.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1 flex items-center gap-2">
                  <User size={14} className="text-[#9CA3AF]" /> Name
                </label>
                <input 
                  type="text" 
                  placeholder="Your Full Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1 flex items-center gap-2">
                  <Mail size={14} className="text-[#9CA3AF]" /> Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#9CA3AF]" /> Message
                </label>
                <textarea 
                  placeholder="How can we help you?"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {contactSubmitted && (
                <div className="bg-[#F9FAFB] p-4 border border-[#E5E7EB] rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                   <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                     <Check size={12} className="text-white" />
                   </div>
                   <p className="text-[11px] font-bold text-black uppercase tracking-widest">Message sent successfully!</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-[#111827] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl outline-none"
              >
                Contact me <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#F9FAFB] border-t border-[#E5E7EB] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-lg font-bold text-black tracking-tight">Academix</span>
            </div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest leading-relaxed">
              © 2025 Academix Education Systems.<br />
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
            <div className="space-y-4 text-left">
              <p className="text-[10px] font-black text-black uppercase tracking-widest text-left">Company</p>
              <ul className="space-y-2 p-0 m-0 list-none text-left">
                <li><button onClick={() => scrollToId('contact-section')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">About</button></li>
                <li><button onClick={() => scrollToId('contact-section')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">Contact</button></li>
                <li><button onClick={() => scrollToId('contact-section')} className="text-[#4B5563] hover:text-black font-medium text-sm transition-colors text-left p-0 border-none bg-transparent block w-full outline-none">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
