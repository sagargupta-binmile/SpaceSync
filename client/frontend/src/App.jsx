import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import MyBookings from './pages/MyBookings';
import BookRoom from './pages/BookRoom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserAccess from './pages/UserAccess';
import { useUserContext } from './context/context';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { subscribeUser } from './push';
import { useEffect } from 'react';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ y: '100%', opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: '-100%', opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();
  const { user, loading } = useUserContext();

  if (user) {
    if (user.role === 'Super Admin') {
      useEffect(() => {
        if (!user) return;
        console.log(user);
        const isSuperAdmin = user.email === 'sunit@binmile.com';
        console.log(isSuperAdmin);
        if (isSuperAdmin === 'false') return;

        if ('Notification' in window && Notification.permission !== 'granted' && isSuperAdmin) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              subscribeUser();
            } else {
              console.warn('🚫 Notification permission denied');
            }
          });
        } else {
          subscribeUser();
        }
      }, [user]);
    }
  }

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
        {/* Main layout with Navbar */}
        <Route path="/" element={<Navbar />}>
          <Route
            index
            element={
              <PageTransition>
                <PrivateRoute user={user}>
                  <BookRoom />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="bookings"
            element={
              <PageTransition>
                <PrivateRoute user={user}>
                  <MyBookings />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="login"
            element={
              <PageTransition>{user ? <Navigate to="/" replace /> : <Login />}</PageTransition>
            }
          />
          <Route
            path="profile"
            element={
              <PageTransition>
                <PrivateRoute user={user}>
                  <Profile />
                </PrivateRoute>
              </PageTransition>
            }
          />
          <Route
            path="user-access"
            element={
              <PageTransition>
                <PrivateRoute user={user}>
                  <AdminRoute role={user?.role}>
                    <UserAccess />
                  </AdminRoute>
                </PrivateRoute>
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
