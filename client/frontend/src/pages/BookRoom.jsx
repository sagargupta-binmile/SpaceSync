import { useEffect, useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useUserContext } from '../context/context';
import { MdChair, MdEvent, MdFilterList,MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Select from 'react-select';
import GlobalCalendar from './GlobalCalendar';

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    readOnly
    value={value}
    onClick={onClick}
    ref={ref}
    className="w-full md:w-[70%] border border-gray-300 p-3 bg-white rounded-xl cursor-pointer"
  />
));

export default function BookRoom() {
  const { roomBooking, bookings, rooms, fetchRooms, fetchBookings, user } = useUserContext();
   const [showCalendar, setShowCalendar] = useState(false);

  const roundToNextFive = (date) => {
    const newDate = new Date(date);
    const minutes = newDate.getMinutes();
    const remainder = minutes % 30;
    if (remainder !== 0) newDate.setMinutes(minutes + (30 - remainder));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  const now = roundToNextFive(new Date());
  const ahead = new Date(now.getTime() + 30 * 60 * 1000);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState(now);
  const [startDate, setStartDate] = useState(now);
  const [endTime, setEndTime] = useState(ahead);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [filterRoom, setFilterRoom] = useState('all');
  const [filterMode, setFilterMode] = useState('upcoming');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [recurrenceRule, setRecurrenceRule] = useState(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(null);

  const roomOptions = rooms.map((r) => ({ value: r.room_id, label: r.room_name }));

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

  useEffect(() => {
    if (!user) return;
    fetchRooms();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRoom, filterMode, fromDate, toDate]);

  const loadBookings = async (page = 1) => {
    if (!user) return;
    try {
      const { totalPages } = await fetchBookings({
        page,
        roomId: filterRoom !== 'all' ? filterRoom : undefined,
        filterMode,
        fromDate,
        toDate,
      });
      setTotalPages(totalPages);
    } catch (err) {
      
    }
  };

  useEffect(() => {
    loadBookings(currentPage);
  }, [currentPage, user, filterRoom, filterMode, fromDate, toDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = roundToNextFive(new Date());
      setStartTime(now);
    }, 60 * 1000);
    setStartTime(roundToNextFive(new Date()));
    return () => clearInterval(interval);
  }, []);
  

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
      const payload = {
        room_id: String(selectedRoom),
        employee_id: String(user.id),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        recurrenceRule: recurrenceRule || null,
        recurrenceEndDate: recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
      };

      const resMessage = await roomBooking(payload);
      loadBookings(currentPage);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('User is not allowed to make bookings');
      } else if (err.response?.status === 409) {
        toast.error(err.response.data?.message || 'Booking conflict detected');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create booking');
      }
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const firstname = user.name.split(' ')[0];

  return (
    <div className="h-full flex justify-center items-start py-4 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/70 backdrop-blur-xl shadow-xl shadow-[#C4B6A6]/40 rounded-3xl w-full h-[87vh] md:max-h-[82vh] overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-6 border border-[#E0D4C7]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}

          
          <form onSubmit={handleBooking} className="space-y-4 sm:space-y-5 ">
            {/* User Info */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 bg-[#7A5C45] text-white flex items-center justify-center rounded-full shadow-md">
                <MdEvent className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-md font-semibold text-[#3C2F2F]">{firstname}</span>
                <span className="text-sm text-gray-500">Booked by</span>
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <h2 className="text-sm font-medium mb-2 text-gray-700">Select a Room</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.room_id}
                    onClick={() => {
                      setFilterRoom(room.room_id);
                      setSelectedRoom(room.room_id);
                    }}
                    className={`relative cursor-pointer p-4 rounded-2xl border shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${
                      filterRoom === room.room_id
                        ? 'bg-[#7A5C45] text-white border-[#7A5C45]'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Room Name */}
                    <h3 className="text-xs font-semibold text-center transition-opacity duration-300">
                      {room.room_name}
                    </h3>

                    {/* Capacity shown only on hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#7A5C45] bg-opacity-90 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-xs font-semibold">{room.room_name}</h3>
                      <div className="flex items-center gap-2 mt-2 bg-white text-[#7A5C45] px-3 py-0 rounded-full text-sm font-medium shadow-sm">
                        <MdChair size={14} />
                        <span>{room.room_capacity} Seats</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex flex-col md:flex-row gap-4 items-start mt-6">
              <div className="flex flex-col w-[60%] sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={() => {
                    setStartDate(startDate);
                  }}
                  dateFormat="d-MMM-yyyy"
                  placeholderText="Select Booking Date"
                  minDate={now}
                  customInput={<CustomInput />}
                />
              </div>

              <div className="flex flex-col w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <DatePicker
                  selected={startTime}
                  onChange={(time) => {
                    if (!time) return;
                    const newStart = new Date(time);
                    if (newStart < now) {
                      toast.error('Start time must be in the future');
                      return;
                    }
                    setStartTime(newStart);

                    const newEnd = new Date(newStart.getTime() + 30 * 60000);
                    setEndTime(newEnd);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="hh:mm aa"
                  customInput={<CustomInput />}
                />
              </div>

              <div className="flex flex-col w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <DatePicker
                  selected={endTime}
                  onChange={(time) => {
                    const newEnd = new Date(endTime);
                    newEnd.setHours(time.getHours(), time.getMinutes());
                    if (newEnd <= startTime) {
                      toast.error('End time must be greater than start time');
                      return;
                    }
                    setEndTime(newEnd);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  dateFormat="hh:mm aa"
                  minTime={startTime}
                  maxTime={new Date().setHours(23, 45)}
                  customInput={<CustomInput />}
                />
              </div>
            </div>

            {/* Recurrence */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
              <Select
                options={[
                  { value: null, label: 'None' },
                  { value: 'DAILY', label: 'Daily' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'MONTHLY', label: 'Monthly' },
                ]}
                value={[
                  { value: null, label: 'None' },
                  { value: 'DAILY', label: 'Daily' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'MONTHLY', label: 'Monthly' },
                ].find((opt) => opt.value === recurrenceRule)}
                onChange={(option) => setRecurrenceRule(option?.value || null)}
                styles={customStyles}
              />
              {recurrenceRule && (
                <DatePicker
                  selected={recurrenceEndDate}
                  onChange={setRecurrenceEndDate}
                  dateFormat="d-MMM-yyyy"
                  placeholderText="Recurrence End Date"
                  minDate={startTime}
                  className="border border-gray-300 p-2 rounded-lg w-full md:w-[70%]"
                />
              )}
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

          <div className="space-y-4">
            {/* Filter Toggle */}
          <div className='flex justify-between'>
              <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#7A5C45] text-white hover:bg-[#9c7353] transition-all"
            >
              <MdFilterList size={20} />
              <span>Filters</span>
            </button>
            <button
        onClick={() => setShowCalendar(true)}
        className="px-4 py-2 bg-[#7A5C45] text-white rounded-lg hover:bg-[#9c7353] transition-all"
      >
        Show Calendar
      </button>
          </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-white rounded-lg shadow-md space-y-4"
                >
                  {/* Room Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Room
                    </label>
                    <Select
                      options={[{ value: 'all', label: 'All' }, ...(roomOptions || [])]}
                      value={[{ value: 'all', label: 'All' }, ...(roomOptions || [])].find(
                        (option) => option.value === filterRoom,
                      )}
                      onChange={(selectedOption) => setFilterRoom(selectedOption?.value || 'all')}
                      placeholder="Select Room"
                      isClearable={false}
                      styles={customStyles}
                    />
                  </div>

                  {/* Filter Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Mode
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {['today', 'upcoming', 'range'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFilterMode(mode)}
                          className={`px-3 py-1 rounded-lg border cursor-pointer ${
                            filterMode === mode ? 'bg-[#7A5C45] text-white' : 'bg-white'
                          }`}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  {filterMode === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Date Range
                      </label>
                      <div className="flex flex-col gap-2">
                        <DatePicker
                          selected={fromDate}
                          onChange={setFromDate}
                          showTimeSelect
                          dateFormat="dd MMM h:mm aa"
                          placeholderText="From Date"
                          className="border border-gray-300 p-2 rounded-lg w-full"
                        />
                        <DatePicker
                          selected={toDate}
                          onChange={setToDate}
                          showTimeSelect
                          dateFormat="dd MMM h:mm aa"
                          placeholderText="To Date"
                          className="border border-gray-300 p-2 rounded-lg w-full"
                        />
                        <button
                          onClick={() => {
                            setFromDate(null);
                            setToDate(null);
                          }}
                          className="px-2 py-2 bg-[#7A5C45] text-white rounded-lg hover:bg-[#9c7353] transition-all w-full"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookings List */}
            <div className="max-h-[69vh] overflow-y-auto">
              {bookings.length > 0 ? (
                <ul className="space-y-2">
                  {bookings.map((room) => (
                    <li key={room.room_id}>
                      <ul className="space-y-2 ml-4">
                        {room.bookings.map((slot) => {
                          const start = new Date(slot.start_time);
                          const end = new Date(slot.end_time);
                          return (
                            <li
                              key={slot.booking_id}
                              className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm"
                            >
                              <div className="inline-block bg-[#7A5C45] text-white text-[1rem] px-2 py-1 rounded-full mb-2">
                                {room.room_name}
                              </div>
                              <div className="font-semibold">{slot.booked_by}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                {start.toDateString() === end.toDateString() ? (
                                  <>
                                    {format(start, 'd-MMM-yyyy')}, {format(start, 'hh:mm aa')} to{' '}
                                    {format(end, 'hh:mm aa')}
                                  </>
                                ) : (
                                  <>
                                    {format(start, 'd-MMM-yyyy, hh:mm aa')} to{' '}
                                    {format(end, 'd-MMM-yyyy, hh:mm aa')}
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center mt-4">
                  No bookings found for the selected filters.
                </p>
              )}
            </div>

            {/* Pagination */}
            {bookings.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === 1 ? 'bg-[#7a6f6f] text-white' : 'bg-[#7a5c45] text-white'
                  }`}
                >
                  Prev
                </button>
                <span className="px-3 py-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === totalPages
                      ? 'bg-[#7a6f6f] text-white'
                      : 'bg-[#7a5c45] text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

        <AnimatePresence>
        {showCalendar && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalendar(false)}
              className="fixed inset-0 bg-black z-40"
            ></motion.div>

            {/* Calendar Popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex justify-center items-center p-4 "
            >
              <div className="bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] rounded-3xl shadow-xl w-full max-w-5xl h-[80vh] overflow-auto relative p-6 scrollbar-hide mt-14">
                {/* Close Button */}
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-4 right-4 text-[#7A5C45] hover:text-[#5c4033] text-3xl font-bold"
                >
                  <MdClose />
                </button>

                {/* Global Calendar */}
                <GlobalCalendar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
