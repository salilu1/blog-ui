import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiLayout, FiChevronDown } from 'react-icons/fi';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout); // Use the logout action from your store
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutAction();
    toast.success('Signed out successfully');
    navigate('/login');
    setProfileOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
  {/* Modern Icon-less Typography Logo */}
  <div className="flex items-baseline tracking-tighter">
    <span className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
      Salilu
    </span>
    <span className="text-2xl font-extrabold text-indigo-600 ml-1">
      Blog
    </span>
  </div>
  
  {/* Optional: A small accent dot to make it look like a tech startup logo */}
  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 animate-pulse" />
</Link>

            {/* Desktop Navigation Links */}
            {/* <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
                Explore
              </Link>
              <Link to="/trending" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
                Trending
              </Link>
            </div> */}
          </div>

          {/* Right Side Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                {/* Profile Toggle */}
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.firstName?.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user.firstName}</span>
                  <FiChevronDown className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <FiLayout /> Admin Dashboard
                        </Link>
                      )}
                      
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <FiUser /> Your Profile
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1"
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.firstName} </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-2 py-2 text-slate-600 font-semibold italic">Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-2 py-2 text-red-500 font-bold">Sign Out</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 text-slate-600 font-bold">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 bg-indigo-600 text-white rounded-xl font-bold">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;