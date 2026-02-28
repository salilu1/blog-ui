import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Blog Platform
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="font-medium">Hello, {user.firstName}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create Account
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;