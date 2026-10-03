import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  X
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@institution.edu).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setServerError('');
    setIsDemoLoading(true);
    try {
      await demoLogin();
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Could not log in as demo student.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-[1px] shadow-xl shadow-sky-500/25 mb-4 animate-glow">
            <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent">
            AI Notice Action Assistant
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Server Error Notification */}
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="student@noticeassistant.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="password-input">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isDemoLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900/90 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth (UI) */}
          <button
            type="button"
            onClick={() => {
              // Simulated OAuth feedback
              alert('Google Single Sign-On is configured for institutional enterprise domains. For quick demonstration, please use the 1-Click Demo Login button below.');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center space-x-3 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* 1-Click Instant Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isLoading || isDemoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              {isDemoLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span>Logging in as Aarav Sharma...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>⚡ 1-Click Demo Login (Aarav Sharma)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Default credentials: <code className="text-slate-400">student@noticeassistant.edu</code> / <code className="text-slate-400">password123</code>
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-sky-400 font-semibold hover:text-sky-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl relative text-center">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Password Assistance</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              AI Notice Action Assistant accounts are synchronized with institutional directories. Please contact your college administrator or use the demo login credentials:
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 text-left font-mono mb-4">
              <div>Email: <strong>student@noticeassistant.edu</strong></div>
              <div>Password: <strong>password123</strong></div>
            </div>
            <button
              onClick={() => {
                setEmail('student@noticeassistant.edu');
                setPassword('password123');
                setIsForgotModalOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-600">
        AI Notice Action Assistant • Smart Circular Reader & Task Execution Platform
      </footer>
    </div>
  );
}
