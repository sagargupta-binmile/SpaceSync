// Register.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '../context/context';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Register() {
  const { register, fetchManager, manager } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    managerId: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchManager();
  }, []);

  // Restrict input dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Allow only letters and spaces
      if (/^[A-Za-z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'email') {
      // Prevent spaces in email
      if (!/\s/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Default for other fields (password, role, etc.)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Validation logic
  const validate = () => {
    const newErrors = {};

    // 🔹 Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should contain only letters and spaces';
    }

    // 🔹 Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // 🔹 Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 🔹 Manager validation
    if (formData.role === 'employee' && !formData.managerId) {
      newErrors.managerId = 'Please select a manager';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        managerId:
          formData.role === 'employee' && formData.managerId
            ? formData.managerId
            : null,
      };
      await register(payload);
      navigate('/login');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/30 backdrop-blur-lg shadow-xl rounded-3xl p-8 w-[420px] border border-white/40"
      >
        <h2 className="text-3xl font-semibold text-center text-[#3c2f2f] mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#7a5c45] outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value.replace(/\s/g, ''), // 🚫 remove spaces
                }))
              }
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault(); // 🚫 block spacebar
              }}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#7a5c45] outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password with eye toggle + dynamic rules */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="border border-gray-300 rounded-2xl px-4 py-3 bg-white/70 w-full focus:outline-none focus:ring-2 focus:ring-[#7a5c45] pr-10"
              />

              {/* Eye toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Error message */}
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

            {/* Live password rules */}
            {formData.password && (
              <div className="mt-2 space-y-1 text-sm">
                <p
                  className={`${
                    formData.password.length >= 6
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {formData.password.length >= 6 ? '✅' : '❌'} At least 6
                  characters
                </p>
                <p
                  className={`${
                    /[A-Z]/.test(formData.password)
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {/[A-Z]/.test(formData.password) ? '✅' : '❌'} At least one
                  uppercase letter
                </p>
                <p
                  className={`${
                    /\d/.test(formData.password)
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {/\d/.test(formData.password) ? '✅' : '❌'} At least one
                  number
                </p>
                <p
                  className={`${
                    /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                    ? '✅'
                    : '❌'}{' '}
                  At least one special character
                </p>
              </div>
            )}
          </div>

          {/* Role */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#7a5c45] outline-none"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          {/* Manager dropdown only for employees */}
          {formData.role === 'employee' && (
            <div>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                disabled={loading}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#7a5c45] outline-none"
              >
                <option value="">Select Manager</option>
                {manager &&
                  manager.length > 0 &&
                  manager.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
              {errors.managerId && (
                <p className="text-red-500 text-sm mt-1">{errors.managerId}</p>
              )}
            </div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            disabled={loading}
            className={`w-full ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#7a5c45] to-[#c89f84]'
            } text-white font-semibold py-3 rounded-xl shadow-md hover:from-[#6a4f3a] hover:to-[#b98f73] transition-all duration-300`}
          >
            {loading ? 'Registering...' : 'Register'}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[#7a5c45] font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
