import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account 🚀
          </h1>
          <p className="text-gray-500 mt-2">
            Join and start sharing your thoughts
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {['firstName','lastName','email','password','confirmPassword'].map((field) => (
            <div key={field} className="mb-4">
              <input
                type={field.includes('password') ? 'password' : 'text'}
                name={field}
                placeholder={
                  field === 'confirmPassword'
                    ? 'Confirm Password'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={(form as any)[field]}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors[field]
                    ? 'border-red-400 focus:ring-red-300'
                    : 'focus:ring-blue-400'
                }`}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field]}
                </p>
              )}
            </div>
          ))}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;