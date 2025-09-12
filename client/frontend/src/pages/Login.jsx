import { motion } from 'framer-motion';
import { useUserContext } from '../context/context';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);

    const width = 400;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 3;

    const popup = window.open(
      'http://localhost:4000/auth/google', // Backend OAuth route
      'GoogleLogin',
      `width=${width},height=${height},top=${top},left=${left}`,
    );

    if (!popup) {
      alert('Popup blocked. Please allow popups for this site.');
      setLoading(false);
      return;
    }

    const messageHandler = (event) => {
      if (event.origin !== 'http://localhost:4000') return;

      const { access_token, error } = event.data;

      if (access_token) {
        localStorage.setItem('token', JSON.stringify(access_token));
        setUser(jwtDecode(access_token));
        navigate('/');
      } else if (error) {
        // Attractive error notification
        toast.error(
          <div className="flex flex-col items-start">
            <span className="font-semibold">Login Failed!</span>
            <span>{error}</span>
          </div>,
          { autoClose: 4000 },
        );
      }

      setLoading(false);
      window.removeEventListener('message', messageHandler);
      clearInterval(pollTimer);
      popup.close();
    };

    window.addEventListener('message', messageHandler);

    // Detect manual popup close
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        setLoading(false);
      }
    }, 500);
  };


  return (
    <div className="LoginPage w-full min-h-screen bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] flex items-center justify-center font-sans overflow-y-hidden">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/60 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-96 flex flex-col items-center border border-white/30 overflow-hidden"
      >
        <h1 className="text-3xl font-bold mb-8 text-[#3c2f2f] text-center">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Sign in with your <span className="font-semibold">@binmile.com</span>{' '}
          email
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`flex items-center justify-center gap-3 w-full py-3 px-5 rounded-2xl font-semibold text-white shadow-lg transition-all ${
            loading
              ? 'opacity-50 cursor-not-allowed bg-gray-400'
              : 'bg-gradient-to-r from-[#7a5c45] to-[#c89f84] hover:from-[#6a4f3a] hover:to-[#b98f73]'
          }`}
        >
          <FcGoogle size={24} />
          {loading ? 'Logging in...' : 'Login with Google'}
        </motion.button>

        <div className="mt-6 w-full text-center text-gray-500 text-sm">
          By logging in, you agree to our{' '}
          <span className="underline cursor-pointer">Terms & Conditions</span>
        </div>
      </motion.div>
    </div>
  );
}
