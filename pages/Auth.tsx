
import React, { useState } from 'react';
import { Eye, EyeOff, Check, ArrowLeft, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (name: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (view === 'login') {
      if (email === 'admin@academix.com' && password === 'password123') {
        onLogin('Admin User');
      } else if (!email || !password) {
        setError('Please fill in all fields');
      } else {
        setError('Invalid credentials. Use admin@academix.com / password123');
      }
    } else if (view === 'signup') {
      if (!name || !email || !password || !retypePassword) {
        setError('All fields are required');
      } else if (password !== retypePassword) {
        setError('Passwords do not match');
      } else if (!acceptedTerms) {
        setError('You must accept the terms and conditions');
      } else {
        onLogin(name);
      }
    } else if (view === 'forgot-password') {
      if (!email) {
        setError('Please enter your email address');
      } else {
        // Simulate password reset request
        setSuccessMsg('A reset link has been sent to your email.');
        // Optionally clear input after some time or just stay there
      }
    }
  };

  // Common input classes to ensure white background and no autofill color
  const inputClasses = "w-full px-5 py-3.5 bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#111827] transition-all text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] [appearance:none] autofill:bg-white autofill:shadow-[0_0_0_30px_white_inset]";

  const renderHeader = () => {
    switch (view) {
      case 'signup':
        return { title: 'Sign Up', sub: 'Create your account' };
      case 'forgot-password':
        return { title: 'Reset Password', sub: 'Enter your email to receive a link' };
      default:
        return { title: 'Login', sub: 'Sign into your account' };
    }
  };

  const header = renderHeader();

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-['Plus_Jakarta_Sans'] overflow-hidden">
      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-1.5">
              {header.title}
            </h1>
            <p className="text-[#9ca3af] text-sm font-medium">
              {header.sub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign up only) */}
            {view === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#111827] ml-1">Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#111827] ml-1">Email</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClasses}
              />
            </div>

            {/* Password Field */}
            {view !== 'forgot-password' && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#111827] ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={inputClasses}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#111827] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Retype Password (Sign up only) */}
            {view === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#111827] ml-1">Retype Password</label>
                <div className="relative">
                  <input 
                    type={showRetypePassword ? "text" : "password"} 
                    placeholder="********"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className={inputClasses}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRetypePassword(!showRetypePassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#111827] transition-colors"
                  >
                    {showRetypePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-[11px] font-bold text-rose-500 pt-0.5 ml-1">{error}</p>}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <p className="text-[11px] font-bold text-emerald-600">{successMsg}</p>
              </div>
            )}

            {/* Footer Options */}
            {view === 'login' && (
              <div className="flex items-center justify-between pt-1 px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only" 
                    />
                    <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                      rememberMe ? 'bg-[#111827] border-[#111827]' : 'bg-white border-[#e5e7eb]'
                    }`}>
                      {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-[#9ca3af] uppercase tracking-widest leading-none">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => { setView('forgot-password'); setError(''); setSuccessMsg(''); }}
                  className="text-[11px] font-black text-[#9ca3af] uppercase tracking-widest hover:text-[#111827] leading-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {view === 'signup' && (
              <div className="flex items-center justify-between pt-1 px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="sr-only" 
                    />
                    <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                      acceptedTerms ? 'bg-[#111827] border-[#111827]' : 'bg-white border-[#e5e7eb]'
                    }`}>
                      {acceptedTerms && <Check size={12} className="text-white" strokeWidth={4} />}
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[#374151]">I accepted all terms & conditions.</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full py-4 bg-[#18181b] text-white rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-black transition-all active:scale-[0.98] mt-4"
            >
              {view === 'login' ? 'Login' : view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
            </button>
          </form>

          {/* Toggle View Link */}
          <div className="text-center mt-7">
            {view === 'forgot-password' ? (
              <button 
                onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#111827] hover:underline"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            ) : (
              <p className="text-xs font-medium text-[#9ca3af]">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-[#111827] hover:underline"
                >
                  {view === 'login' ? 'Register here' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
          
          {/* Demo Credentials for Login */}
          {view === 'login' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Demo Access</p>
              <p className="text-[11px] text-[#4b5563] font-bold">admin@academix.com • password123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
