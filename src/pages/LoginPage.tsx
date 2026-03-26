import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import { login } from '../api/auth.api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null); // New state for API errors
  const [loading, setLoading] = useState(false);

  // --- Frontend Validation Logic ---
  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    if (serverError) setServerError(null); // Clear server error when user types
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    const emailError = !form.email ? 'Email is required' : errors.email;
    const passwordError = !form.password ? 'Password is required' : errors.password;
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      toast.error("Please check your input fields");
      return;
    }

    try {
      setLoading(true);
      const res = await login(form);
      
      setToken(res.data.access_token);
      setUser(res.data.user);
      
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      res.data.user.role === 'ADMIN' ? navigate('/admin') : navigate('/');
    } catch (err: any) {
      // --- Enhanced Exception Handling ---
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';

      if (status === 401) {
        setServerError("Invalid email or password. Please try again.");
      } else if (status === 403) {
        setServerError("Your account has been suspended or restricted.");
      } else if (status === 429) {
        setServerError("Too many login attempts. Please try again later.");
      } else {
        setServerError(message);
      }
      
      toast.error(status === 401 ? "Login Failed" : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* LEFT HERO SECTION - Kept as is for brand consistency */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex md:w-1/2 bg-slate-900 p-16 flex-col justify-between text-white relative"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" 
          />
        </div>
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-1">
            <span className="text-white">Salilu</span>
            <span className="text-indigo-500 underline decoration-2 underline-offset-4">Blog</span>
          </Link>
        </div>
        <div className="relative z-10">
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="inline-block px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Exclusive Creator Space
          </motion.span>
          <h2 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
            Saleamlak's <br/> <span className="text-indigo-500">Official</span> Journal.
          </h2>
          <p className="text-slate-400 text-xl max-w-md leading-relaxed">
            The only place to read Saleamlak's verified posts and share your thoughts.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">
          <div className="w-8 h-[1px] bg-slate-700" />
          Established 2026
        </div>
      </motion.div>

      {/* RIGHT LOGIN SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100"
        >
          <header className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Sign In</h1>
            <p className="text-slate-400 font-medium">Log in to interact with Saleamlak's latest stories.</p>
          </header>

          {/* SERVER ERROR ALERT BOX */}
          <AnimatePresence>
            {serverError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
                  <FiAlertCircle className="shrink-0 text-lg" />
                  <p>{serverError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <AnimatePresence>
                  {form.email && !errors.email && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-sm">
                      <FiCheckCircle />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative group">
                <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                <input
                  name="email"
                  type="email"
                  placeholder="name@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                    errors.email ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.email}</p>}
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                    errors.password ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.password}</p>}
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Blog <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-slate-400 font-medium">
              New here?{' '}
              <Link to="/register" className="text-indigo-600 font-black hover:underline underline-offset-4 decoration-2">
                Create Account
              </Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;