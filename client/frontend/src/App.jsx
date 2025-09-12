import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import MyBookings from './pages/MyBookings';
import BookRoom from './pages/Bookroom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import { useUserContext } from './context/context'; 
import Profile from './pages/Profile';

export default function App() {
  const location = useLocation();
  const { user, loading } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navbar />}>
          {/* Book Room Page (Protected) */}
          <Route
            index
            path="/"
            element={
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="min-h-screen"
              >
                {user ? <BookRoom /> : <Navigate to="/login" />}
              </motion.div>
            }
          />


          {/* Login Page */}
          <Route
            path="login"
            element={
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="min-h-screen"
              >
                {user ? <Navigate to="/" /> : <Login />}
              </motion.div>
            }
          />
          {/* Login Page */}
          <Route
            path="profile"
            element={
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="min-h-screen"
              >
                {user ? <Profile /> : <Navigate to="/login" />}
              </motion.div>
            }
          />

          {/* My Bookings Page (Protected) */}
          <Route
            path="bookings"
            element={
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="min-h-screen"
              >
                {user ? <MyBookings /> : <Navigate to="/login" />}
              </motion.div>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
