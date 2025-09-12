import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useUserContext } from '../context/context';
import { MdEvent } from 'react-icons/md';
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function MyBookings() {
  const {
    user,
    bookings,
    fetchBookings,
    updateBooking,
    deleteBooking,
    setBookings,
  } = useUserContext();

  const [editedBookings, setEditedBookings] = useState({});
  const [bookingView, setBookingView] = useState('my'); // 'my' or 'all'

  console.log(user);
  console.log(bookings);

  const [disabledBookings, setDisabledBookings] = useState({});
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const viewOptions = [
    { value: 'my', label: 'My Bookings' },
    { value: 'all', label: 'All Bookings' },
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#7A5C45' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #7A5C45' : null,
      '&:hover': {
        borderColor: '#7A5C45',
      },
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '2px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#7A5C45' : 'white',
      color: state.isFocused ? 'white' : '#333',
      '&:hover': {
        backgroundColor: '#7A5C45',
        color: 'white',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      marginTop: 0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxHeight: '800px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#3C2F2F',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#888',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#7A5C45',
      '&:hover': {
        color: '#5a4635',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#7A5C45',
      '&:hover': {
        color: '#5a4635',
      },
    }),
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[d.getMonth()];
    return `${day} ${month}`;
  };

  const formatTime = (date) => {
    const d = new Date(date);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes.toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };

  const normalizeBooking = (b) => ({
    ...b,
    start_time: new Date(
      (editedBookings[b.booking_id]?.start_time ?? b.start_time) || new Date(),
    ),
    end_time: new Date(
      (editedBookings[b.booking_id]?.end_time ?? b.end_time) || new Date(),
    ),
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const role = user.role;
      let fetchParams = { page: currentPage, role };
      if (role === 'employee' || role === 'manager') {
        fetchParams.userId = user.id;
      }
      const data = await fetchBookings(fetchParams);
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, currentPage]);

  useEffect(() => {
    if (!bookings) return;
    const groups = {};
    bookings.forEach((room) => {
      room.bookings.forEach((b) => {
        if (!groups[room.room_id]) {
          groups[room.room_id] = {
            room_id: room.room_id,
            room_name: room.room_name,
            bookings: [],
          };
        }
        groups[room.room_id].bookings.push(
          normalizeBooking({
            ...b,
            room_id: room.room_id,
            room_name: room.room_name,
          }),
        );
      });
    });
    setGroupedBookings(Object.values(groups));
  }, [bookings]);

  const getFilteredBookings = () => {
    const today = new Date();
    return groupedBookings
      .map((room) => {
        let filtered = room.bookings;

        if (filter === 'today') {
          filtered = filtered.filter((b) => {
            const start = new Date(b.start_time);
            return (
              start.getDate() === today.getDate() &&
              start.getMonth() === today.getMonth() &&
              start.getFullYear() === today.getFullYear()
            );
          });
        } else if (filter === 'upcoming') {
          filtered = filtered.filter((b) => new Date(b.start_time) > today);
        } else if (filter === 'range' && fromDate && toDate) {
          filtered = filtered.filter((b) => {
            const start = new Date(b.start_time);
            return start >= fromDate && start <= toDate;
          });
        }

        if (selectedRoomId !== 'all') {
          filtered = filtered.filter((b) => b.room_id === selectedRoomId);
        }

        if (bookingView === 'my') {
          filtered = filtered.filter((b) => b.user_id === user.id);
        }

        return { ...room, bookings: filtered };
      })
      .filter((room) => room.bookings.length > 0);
  };

  const handleDateChange = (bookingId, field, value) => {
    setEditedBookings((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (booking) => {
    const bookingId = booking.booking_id;
    if (disabledBookings[bookingId]) return;

    setDisabledBookings((prev) => ({ ...prev, [bookingId]: true }));
    setTimeout(() => {
      setDisabledBookings((prev) => ({ ...prev, [bookingId]: false }));
    }, 1500);

    const edited = editedBookings[bookingId] || {};
    const start_time = edited.start_time || new Date(booking.start_time);
    const end_time = edited.end_time || new Date(booking.end_time);

    if (
      !booking.booking_id ||
      !booking.room_id ||
      !(start_time instanceof Date) ||
      isNaN(start_time.getTime()) ||
      !(end_time instanceof Date) ||
      isNaN(end_time.getTime())
    ) {
      toast.error('All fields are required');
      return;
    }

    try {
      await updateBooking(
        booking.room_id,
        booking.booking_id,
        start_time,
        end_time,
      );

      setGroupedBookings((prev) =>
        prev.map((room) =>
          room.room_id === booking.room_id
            ? {
                ...room,
                bookings: room.bookings.map((b) =>
                  b.booking_id === booking.booking_id
                    ? normalizeBooking({ ...b, start_time, end_time })
                    : normalizeBooking(b),
                ),
              }
            : room,
        ),
      );
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (booking) => {
    const bookingId = booking.booking_id;
    if (disabledBookings[bookingId]) return;

    setDisabledBookings((prev) => ({ ...prev, [bookingId]: true }));
    setTimeout(() => {
      setDisabledBookings((prev) => ({ ...prev, [bookingId]: false }));
    }, 1500);

    if (!booking.booking_id) return;

    try {
      await deleteBooking(booking.booking_id);
      setGroupedBookings((prev) =>
        prev
          .map((room) =>
            room.room_id === booking.room_id
              ? {
                  ...room,
                  bookings: room.bookings.filter(
                    (b) => b.booking_id !== booking.booking_id,
                  ),
                }
              : room,
          )
          .filter((room) => room.bookings.length > 0),
      );
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading bookings...
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const roomOptions = groupedBookings.map((room) => ({
    value: room.room_id,
    label: room.room_name || 'Unnamed Room',
  }));

  return (
    <div className="max-h-[85vh]  h-auto overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-8 bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] py-10 px-4 sm:px-6 lg:px-8">
      <div id="datepicker-portal"></div>
      <div id="select-portal"></div>
      <div className="max-w-5xl mx-auto ">
        {/* Filters */}
        <div className=" mb-4 flex flex-wrap items-center gap-3 p-4 bg-white/50 backdrop-blur-lg rounded-2xl shadow-md border border-white/30">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'today', 'upcoming'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${
                  filter === f
                    ? 'bg-[#7a5c45] text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Room Select */}
          <Select
            options={roomOptions}
            value={
              roomOptions.find((option) => option.value === selectedRoomId) ||
              null
            }
            onChange={(selectedOption) =>
              setSelectedRoomId(selectedOption ? selectedOption.value : 'all')
            }
            placeholder="All Rooms"
            isClearable
            styles={customStyles}
            className="min-w-[150px]"
            menuPortalTarget={document.getElementById('select-portal')}
          />

          {/* View Select */}
          <Select
            options={viewOptions}
            value={viewOptions.find((opt) => opt.value === bookingView)}
            onChange={(selectedOption) =>
              setBookingView(selectedOption ? selectedOption.value : 'my')
            }
            placeholder="View Bookings"
            styles={customStyles}
            className="min-w-[150px]"
            menuPortalTarget={document.getElementById('select-portal')}
          />

          {/* Date Pickers */}
          <DatePicker
            selected={fromDate}
            onChange={(date) => {
              setFromDate(date);
              setFilter('range');
            }}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="From"
            className="border border-gray-300 p-2 rounded-lg w-[80px]"
            popperPlacement="bottom-start"
            portalId="datepicker-portal"
          />

          <DatePicker
            selected={toDate}
            onChange={(date) => {
              setToDate(date);
              setFilter('range');
            }}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="To"
            className="border border-gray-300 p-2 rounded-lg w-[80px]"
            popperPlacement="bottom-start"
            portalId="datepicker-portal"
          />

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setFilter('all');
            }}
            className="px-3 py-2 bg-[#7A5C45] text-white rounded-lg hover:bg-[#9c7353] transition-all text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <p className="text-gray-500 text-center text-lg">
            No bookings found.
          </p>
        ) : (
          <div className="space-y-8">
            {filteredBookings.map((room) => (
              <div
                key={room.room_id}
                className="bg-white/50 backdrop-blur-lg shadow-md rounded-2xl p-4 sm:p-6 border border-white/30"
              >
                <h2 className="text-xl font-semibold text-[#3c2f2f] mb-4 flex flex-wrap items-center gap-2">
                  <MdEvent className="text-[#7a5c45]" />
                  {room.room_name || 'Unnamed Room'}
                </h2>

                <div className="space-y-4 overflow-x-auto">
                  {room.bookings.map((b) => {
                    const edited = {
                      ...b,
                      ...editedBookings[b.booking_id],
                      start_time: new Date(
                        editedBookings[b.booking_id]?.start_time ??
                          b.start_time,
                      ),
                      end_time: new Date(
                        editedBookings[b.booking_id]?.end_time ?? b.end_time,
                      ),
                    };

                    const isOwnBooking = b.booked_by === user.name;
                    const isStartTimeInPast =
                      new Date(edited.start_time) <= new Date();

                    return (
                      <div
                        key={b.booking_id}
                        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${
                          !isOwnBooking ? 'md:flex-row md:items-center' : ''
                        }`}
                      >
                        <div
                          className={`text-sm text-gray-700 ${
                            !isOwnBooking
                              ? 'flex flex-row gap-4 items-center w-full'
                              : 'flex-1 min-w-[180px]'
                          }`}
                        >
                          <p>
                            <span className="font-medium">Booked by:</span>{' '}
                            {b.booked_by || 'Unknown'}
                          </p>
                          <p>
                            <span className="font-medium">From:</span>{' '}
                            {formatDate(edited.start_time)}{' '}
                            {formatTime(edited.start_time)}
                          </p>
                          <p>
                            <span className="font-medium">To:</span>{' '}
                            {formatDate(edited.end_time)}{' '}
                            {formatTime(edited.end_time)}
                          </p>
                        </div>

                        {isOwnBooking && (
                          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                            <DatePicker
                              selected={edited.start_time}
                              onChange={(date) =>
                                handleDateChange(
                                  b.booking_id,
                                  'start_time',
                                  date,
                                )
                              }
                              showTimeSelect
                              dateFormat="d MMM yyyy h:mm aa"
                              className="border border-gray-300 p-2 rounded-lg w-full sm:w-44"
                              minDate={new Date()}
                              minTime={
                                new Date(edited.start_time).toDateString() ===
                                new Date().toDateString()
                                  ? new Date()
                                  : new Date().setHours(0, 0, 0)
                              }
                              maxTime={new Date().setHours(23, 45)}
                              popperPlacement="bottom-start"
                              portalId="datepicker-portal"
                              disabled={isStartTimeInPast}
                            />

                            <DatePicker
                              selected={edited.end_time}
                              onChange={(date) =>
                                handleDateChange(b.booking_id, 'end_time', date)
                              }
                              showTimeSelect
                              dateFormat="d MMM yyyy h:mm aa"
                              className="border border-gray-300 p-2 rounded-lg w-full sm:w-44"
                              minTime={edited.start_time}
                              maxTime={new Date().setHours(23, 45)}
                              popperPlacement="bottom-start"
                              portalId="datepicker-portal"
                              disabled={isStartTimeInPast}
                            />

                            {!isStartTimeInPast && (
                              <button
                                onClick={() => handleUpdate(b)}
                                disabled={disabledBookings[b.booking_id]}
                                className={`cursor-pointer px-4 py-2 rounded-lg shadow-md text-sm transition-all w-full sm:w-auto ${
                                  disabledBookings[b.booking_id]
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-[#7a5c45] text-white hover:bg-[#9c7353]'
                                }`}
                              >
                                Update
                              </button>
                            )}

                            {!isStartTimeInPast && (
                              <button
                                onClick={() => handleDelete(b)}
                                disabled={disabledBookings[b.booking_id]}
                                className={`cursor-pointer px-4 py-2 rounded-lg shadow-md text-sm transition-all w-full sm:w-auto ${
                                  disabledBookings[b.booking_id]
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-[#7a5c45] text-white hover:bg-[#9c7353]'
                                }`}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === index + 1
                  ? 'bg-[#7A5C45] text-white'
                  : 'bg-white text-gray-700'
              } hover:bg-[#7A5C45] hover:text-white transition-all`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
