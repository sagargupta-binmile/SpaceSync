import React, { useEffect } from 'react';
import { useUserContext } from '../context/context';
import { useNavigate } from 'react-router-dom';
import img from '../assets/interactionroom.jpg';
import { FaUserTie } from 'react-icons/fa6';
import { motion } from 'framer-motion';

function Home() {
  const { user, loading } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user?.name) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleBooking = () => {
    navigate('/book-room');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] flex items-center justify-center font-sans overflow-hidden">
      {user?.name && (
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center w-full max-w-5xl px-4 md:px-6 ">
          {/* User Info */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/30 backdrop-blur-md shadow-xl rounded-3xl p-6 md:h-[460px] md:p-8 w-full md:w-96 flex flex-col items-center justify-center text-center border border-white/40"
          >
            <div className="flex justify-center mb-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="bg-white/60 rounded-full p-4 shadow-md"
              >
                <FaUserTie className="text-4xl text-[#7a5c45]" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-semibold text-[#3c2f2f]">Hi, {user.name}</h1>
          </motion.div>

          {/* Book Room Section */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            className="rounded-3xl p-6 md:p-6 shadow-xl bg-white/40 backdrop-blur-lg w-full md:w-[460px] flex flex-col justify-between border border-white/30"
          >
            <motion.img
              src={img}
              alt="room"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="w-full h-64 md:h-80 object-cover rounded-2xl mb-6 shadow-md"
            />

            <motion.button
              onClick={handleBooking}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="w-full bg-gradient-to-r from-[#7a5c45] to-[#c89f84] hover:from-[#6a4f3a] hover:to-[#b98f73] text-white font-semibold py-4 rounded-2xl shadow-md transition-all duration-300"
            >
              Book Now
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Home;
