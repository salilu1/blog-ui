import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore'; // Assuming you have a logout action here

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: '📊', exact: true },
    { name: 'Posts', path: '/admin/posts', icon: '📝' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        {/* <div className="p-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">
              B
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              BLOG<span className="text-indigo-600">OS</span>
            </span>
          </Link>
        </div> */}

        <nav className="flex-1 px-4 space-y-1.5 pt-10">
          <p className="px-4 text-[15px] font-bold text-slate-600 uppercase tracking-widest mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => {
            // Check if link is active
            const isActive = item.exact 
              ? pathname === item.path 
              : pathname.startsWith(item.path) && item.path !== '/admin' || (item.path === '/admin' && pathname === '/admin');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={`text-lg ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span> 
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Admin Area
            </h1>
            <p className="text-lg font-bold text-slate-800 capitalize">
              {pathname.split('/').pop() || 'Overview'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">
                {user?.firstName} 
              </span>
              <span className="text-xs text-slate-400">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
              {user?.firstName?.charAt(0)}
            </div>
          </div>
        </header> */}

        <div className="p-4 md:p-10 max-w-7xl">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;