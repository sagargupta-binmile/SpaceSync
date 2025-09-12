import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useUserContext } from '../context/context';
import { MdEvent, MdFilterList } from 'react-icons/md';

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function BookRoom() {
  const { roomBooking, bookings, rooms, fetchRooms, fetchBookings, user } =
    useUserContext();

  const roundToNextFive = (date) => {
    const newDate = new Date(date);
    const minutes = newDate.getMinutes();
    const remainder = minutes % 30;

    if (remainder !== 0) {
      newDate.setMinutes(minutes + (30 - remainder));
    }
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
  };

  const now = roundToNextFive(new Date());
  const ahead = new Date(now.getTime() + 30 * 60 * 1000);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState(now);
  const [endTime, setEndTime] = useState(ahead);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [filterRoom, setFilterRoom] = useState(
    () => localStorage.getItem('filterRoom') || 'all',
  );
  const [filterMode, setFilterMode] = useState(
    () => localStorage.getItem('filterMode') || 'upcoming',
  );
  const [fromDate, setFromDate] = useState(() => {
    const stored = localStorage.getItem('fromDate');
    return stored ? new Date(stored) : null;
  });
  const [toDate, setToDate] = useState(() => {
    const stored = localStorage.getItem('toDate');
    return stored ? new Date(stored) : null;
  });

  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (!user) return;
    fetchRooms();
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (fromDate) localStorage.setItem('fromDate', fromDate.toISOString());
    else localStorage.removeItem('fromDate');
  }, [fromDate]);

  useEffect(() => {
    if (toDate) localStorage.setItem('toDate', toDate.toISOString());
    else localStorage.removeItem('toDate');
  }, [toDate]);

  useEffect(() => {
    const now = new Date();
    if (startTime <= now) {
      const rounded = roundToNextFive(now);
      setStartTime(rounded);

      const newEnd = new Date(rounded.getTime() + 30 * 60 * 1000);
      setEndTime(newEnd);
    }
  }, [startTime]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (buttonDisabled) return;
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 1500);

    if (!selectedRoom || !startTime || !endTime) {
      toast.error('All fields are required');
      return;
    }

    try {
      await roomBooking({
        room_id: String(selectedRoom),
        employee_id: String(user.id),
        startTime: new Date(
          new Date(startTime).getTime() + 1 * 30 * 1000,
        ).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      await fetchBookings();
    } catch (err) {}
  };

  const filterBookings = (slots) => {
    const now = new Date();
    return slots
      .filter((slot) => {
        const start = new Date(slot.start_time);
        const end = new Date(slot.end_time);

        if (fromDate && start < fromDate) return false;
        if (toDate && end > toDate) return false;

        if (filterMode === 'today')
          return start.toDateString() === now.toDateString();
        if (filterMode === 'upcoming') return start > now;
        return true;
      })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time)); // latest first
  };

  const getFilteredBookings = () => {
    let allSlots = [];
    rooms.forEach((room) => {
      // Always apply the room filter
      if (filterRoom !== 'all' && room.id !== filterRoom) return;
      const roomBookings =
        bookings.find((b) => b.room_id === room.id)?.bookings || [];
      allSlots.push(
        ...roomBookings.map((slot) => ({
          ...slot,
          roomName: room.name,
        })),
      );
    });
    return filterBookings(allSlots);
  };

  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: room.name,
  }));

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#7A5C45' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #7A5C45' : null,
      '&:hover': { borderColor: '#7A5C45' },
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '2px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#7A5C45' : 'white',
      color: state.isFocused ? 'white' : '#333',
      '&:hover': { backgroundColor: '#7A5C45', color: 'white' },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      marginTop: 0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxHeight: '800px',
    }),
    singleValue: (provided) => ({ ...provided, color: '#3C2F2F' }),
    placeholder: (provided) => ({ ...provided, color: '#888' }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#7A5C45',
      '&:hover': { color: '#5a4635' },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#7A5C45',
      '&:hover': { color: '#5a4635' },
    }),
  };

  const filteredBookings = getFilteredBookings();
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="h-full flex justify-center items-start py-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/70 backdrop-blur-xl shadow-xl shadow-[#C4B6A6]/40 rounded-3xl w-full max-h-[85vh]  h-auto overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-8 border border-[#E0D4C7]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <form onSubmit={handleBooking} className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 mt-2">
              {/* Icon Circle */}
              <div className="w-10 h-10 bg-[#7A5C45] text-white flex items-center justify-center rounded-full shadow-md">
                <MdEvent className="text-xl" />
              </div>

              {/* Employee name + subtitle */}
              <div className="flex flex-col">
                <span className="text-md font-semibold text-[#3C2F2F]">
                  {user.name}
                </span>
                <span className="text-sm text-gray-500">Booking done by</span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium mb-2 text-gray-700">
                Select a Room
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setFilterRoom(room.id); // keep room filter applied
                      setSelectedRoom(room.id);
                    }}
                    className={`cursor-pointer p-2 rounded-xl border shadow-md transition-all ${
                      filterRoom === room.id
                        ? 'bg-[#7A5C45] text-white border-[#7A5C45]'
                        : 'bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    <h3 className="text-md text-center">{room.name}</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Pickers */}
            <div className="flex flex-col md:flex-row gap-4 items-start mt-6">
              <div className="flex flex-col w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <DatePicker
                  selected={startTime}
                  onChange={(date) => {
                    const newDate = new Date(date);
                    newDate.setHours(
                      startTime.getHours(),
                      startTime.getMinutes(),
                    );
                    setStartTime(newDate);

                    const newEnd = new Date(date);
                    newEnd.setHours(endTime.getHours(), endTime.getMinutes());
                    setEndTime(newEnd);
                  }}
                  dateFormat="d-MMM-yyyy"
                  placeholderText="Select Booking Date"
                  className="w-full md:w-[72%] border border-gray-300 p-3 bg-white rounded-xl"
                  showTimeSelect={false}
                />
              </div>

              <div className="flex flex-col w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <DatePicker
                  selected={startTime}
                  onChange={(time) => {
                    const newStart = new Date(startTime);
                    newStart.setHours(time.getHours(), time.getMinutes());
                    setStartTime(newStart);

                    const newEnd = new Date(newStart);
                    newEnd.setMinutes(newEnd.getMinutes() + 30);
                    setEndTime(newEnd);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Start Time"
                  dateFormat="hh:mm aa"
                  minTime={
                    startTime.toDateString() === new Date().toDateString()
                      ? new Date()
                      : new Date().setHours(0, 0, 0)
                  }
                  maxTime={new Date().setHours(23, 45)}
                  className="w-full md:w-[60%] border border-gray-300 p-3 bg-white rounded-xl"
                />
              </div>

              <div className="flex flex-col w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <DatePicker
                  selected={endTime}
                  onChange={(time) => {
                    const newEnd = new Date(endTime);
                    newEnd.setHours(time.getHours(), time.getMinutes());
                    setEndTime(newEnd);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="End Time"
                  dateFormat="hh:mm aa"
                  minTime={startTime}
                  maxTime={new Date().setHours(23, 45)}
                  className="w-full  md:w-[60%] border border-gray-300 p-3 bg-white rounded-xl"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={buttonDisabled}
              className={`w-full px-4 py-3 sm:py-2 rounded-xl transition-all cursor-pointer mt-4 ${
                buttonDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#7A5C45] text-white hover:bg-[#8f6e54]'
              }`}
            >
              {buttonDisabled ? 'Booking...' : 'Book Room'}
            </motion.button>
          </form>

          {/* Filters & Bookings Section */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#3C2F2F]">
                {selectedRoom
                  ? `Bookings for ${rooms.find((r) => r.id === selectedRoom)?.name}`
                  : 'Bookings'}
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <MdFilterList className="text-2xl text-[#7A5C45]" />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-white rounded-lg shadow-md space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Room
                    </label>
                    <Select
                      options={[{ value: 'all', label: 'All' }, ...roomOptions]}
                      value={
                        [{ value: 'all', label: 'All' }, ...roomOptions].find(
                          (option) => option.value === filterRoom,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        setFilterRoom(
                          selectedOption ? selectedOption.value : 'all',
                        )
                      }
                      placeholder="Select Room"
                      isClearable={false}
                      styles={customStyles}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Mode
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {['all', 'today', 'upcoming'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFilterMode(mode)}
                          className={`px-3 py-1 rounded-lg border cursor-pointer ${
                            filterMode === mode
                              ? 'bg-[#7A5C45] text-white'
                              : 'bg-white'
                          }`}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Date Range
                    </label>
                    <div className="flex justify-around items-center mb-2 gap-2">
                      <DatePicker
                        selected={fromDate}
                        onChange={(date) => setFromDate(date)}
                        showTimeSelect
                        dateFormat="Pp"
                        placeholderText="From Date"
                        className="border border-gray-300 p-2 rounded-lg w-full md:w-[60%]"
                      />
                      <DatePicker
                        selected={toDate}
                        onChange={(date) => setToDate(date)}
                        showTimeSelect
                        dateFormat="Pp"
                        placeholderText="To Date"
                        className="border border-gray-300 p-2 rounded-lg w-full md:w-[60%]"
                      />
                      <button
                        onClick={() => {
                          setFromDate(null);
                          setToDate(null);
                        }}
                        className="px-2 py-2 bg-[#7A5C45] text-white rounded-lg hover:bg-[#9c7353] transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookings List */}
            <div className="max-h-[350px] overflow-y-auto mb-4 scrollbar-hide">
              {paginatedBookings.length > 0 ? (
                <ul className="space-y-2">
                  {paginatedBookings.map((slot) => {
                    const start = new Date(slot.start_time);
                    const end = new Date(slot.end_time);
                    return (
                      <li
                        key={slot.booking_id}
                        className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm"
                      >
                        <div>{slot.booked_by}</div>
                        {(!selectedRoom || selectedRoom === 'all') && (
                          <div>{`Room Name: ${slot.roomName}`}</div>
                        )}
                        <div>{`${format(start, 'd-MMM-yyyy, hh:mm aa')} to ${format(end, 'd-MMM-yyyy, hh:mm aa')}`}</div>
                        <div>{slot.name}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  {selectedRoom
                    ? 'No bookings for this room'
                    : 'No bookings found'}
                </p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg border ${
                        page === currentPage
                          ? 'bg-[#7A5C45] text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
