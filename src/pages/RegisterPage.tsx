import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time Validation (Identical logic to Login)
  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'firstName' && !value) error = 'First name is required';
    if (name === 'lastName' && !value) error = 'Last name is required';
    if (name === 'email') {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Minimum 6 characters';
    }
    if (name === 'confirmPassword') {
      if (value !== form.password) error = 'Passwords do not match';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check
    if (Object.values(errors).some(err => err !== '') || !form.email || !form.password) {
      toast.error("Please fill the form correctly");
      return;
    }

    try {
      setLoading(true);
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success('Account created! Welcome to the community.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* LEFT SECTION (Identical to Login) */}
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
            Reader Registration
          </motion.span>
          <h2 className="text-6xl font-black leading-[1.1] mb-8 tracking-tight">
            Join the <br/> <span className="text-indigo-500">Discussion</span> today.
          </h2>
          <p className="text-slate-400 text-xl max-w-md leading-relaxed">
            Create an account to comment on Saleamlak's posts and save your favorite articles.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">
          <div className="w-8 h-[1px] bg-slate-700" />
          The Exclusive Voice
        </div>
      </motion.div>

      {/* RIGHT SECTION: Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 overflow-y-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 my-8"
        >
          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-400 font-medium italic">Join our reading community.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  placeholder="John"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <AnimatePresence>
                  {form.email && !errors.email && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-sm"><FiCheckCircle /></motion.span>
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

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
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

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Register Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4 decoration-2">
                Sign In
              </Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;