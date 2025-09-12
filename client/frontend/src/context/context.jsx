import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

const backend = 'http://localhost:4000';
const UserContext = createContext();

const api = axios.create({ baseURL: backend });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
  }
  return config;
});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const decoded = jwtDecode(JSON.parse(storedToken));
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Invalid token', err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (email) => {
    try {
      const res = await api.post('/auth/google-login', { email });
      const { access_token } = res.data;

      
      localStorage.setItem('token', JSON.stringify(access_token));

  
      const decodedUser = jwtDecode(access_token);
      setUser(decodedUser);

      toast.success('Logged in with Google successfully');
      return decodedUser;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  // Booking functions
  const roomBooking = async (data) => {
    try {
      const res = await api.post('/bookings', data);
      toast.success(res.data.message || 'Booking successful');
      await fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book the room');
    }
  };

  const updateBooking = async (room_id, booking_id, start_time, end_time) => {
    try {
      const payload = {
        booking_id,
        room_id,
        start_time:
          start_time instanceof Date ? start_time.toISOString() : start_time,
        end_time: end_time instanceof Date ? end_time.toISOString() : end_time,
      };

      const res = await api.patch('/bookings', payload);
      const updatedBooking = res.data;
      updatedBooking.start_time = new Date(
        updatedBooking.start_time ?? updatedBooking.startTime,
      );
      updatedBooking.end_time = new Date(
        updatedBooking.end_time ?? updatedBooking.endTime,
      );

      toast.success('Booking updated successfully');
      return updatedBooking;
    } catch (err) {
      console.error('Update booking error:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking');
      throw err;
    }
  };

  const deleteBooking = async (booking_id) => {
    if (!booking_id) return toast.error('Invalid booking ID');
    try {
      await api.delete(`/bookings/${booking_id}`);
      toast.success('Deleted successfully');
      await fetchBookings();
    } catch (err) {
      toast.error('Error deleting booking');
    }
  };

  // Fetching functions
  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      toast.error('Error fetching rooms');
    }
  };

  const fetchBookings = async ({ userId, role, page = 1 } = {}) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (role) params.append('role', role);
      params.append('page', page);

      const url = params.toString()
        ? `/bookings?${params.toString()}`
        : '/bookings';
      const res = await api.get(url);
      const data = res.data;

      setBookings(data.bookings);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching bookings');
      setBookings([]);
      return { bookings: [], totalPages: 1 };
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users');
      setEmployees(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching employees');
      setEmployees([]);
    }
  };

  const fetchManager = async () => {
    try {
      const res = await api.get('/users/manager');
      setManager(res.data);
    } catch (error) {}
  };

  return (
    <UserContext.Provider
      value={{
        loginWithGoogle, // ✅ Google login added
        logout,
        user,
        setUser,
        bookings,
        setBookings,
        roomBooking,
        updateBooking,
        deleteBooking,
        rooms,
        fetchRooms,
        fetchBookings,
        employees,
        fetchEmployees,
        loading,
        setLoading,
        fetchManager,
        manager,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error('useUserContext must be used within a UserContextProvider');
  return context;
}
