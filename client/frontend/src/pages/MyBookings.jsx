import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useUserContext } from '../context/context';
import { MdEvent } from 'react-icons/md';
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function MyBookings() {
  const { user, bookings, fetchBookings, updateBooking, deleteBooking, setBookings } =
    useUserContext();

  const [editedBookings, setEditedBookings] = useState({});
  const [bookingView, setBookingView] = useState('my');
  const [disabledBookings, setDisabledBookings] = useState({});
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [actionBooking, setActionBooking] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const viewOptions = [
    { value: 'my', label: 'My Bookings' },
    { value: 'all', label: 'All Bookings' },
  ];

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
    setCurrentPage(1);
  }, [filter, selectedRoomId, bookingView, fromDate, toDate]);

  const formatDate = (date) => {
    const d = new Date(date);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
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

  const normalizeBooking = (b) => {
    const edited = editedBookings[b.booking_id];
    return {
      ...b,
      start_time: edited?.start_time ? new Date(edited.start_time) : new Date(b.start_time),
      end_time: edited?.end_time ? new Date(edited.end_time) : new Date(b.end_time),
    };
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchParams = {
        page: currentPage,
        roomId: selectedRoomId !== 'all' ? selectedRoomId : undefined,
        filterMode: filter,
      };
      if (filter === 'range' && fromDate && toDate) {
        fetchParams.fromDate = fromDate;
        fetchParams.toDate = toDate;
      }
      if (bookingView === 'my') {
        fetchParams.userId = user.id;
      }
      const data = await fetchBookings(fetchParams);
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, currentPage, filter, selectedRoomId, bookingView, fromDate, toDate]);

  const hasBookings = bookings.some((room) => room.bookings.length > 0);

  const handleDateChange = (bookingId, field, value, originalValue) => {
    setEditedBookings((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value },
    }));

    setTimeout(() => {
      setEditedBookings((prev) => {
        if (prev[bookingId]?.[field] === value) {
          return {
            ...prev,
            [bookingId]: { ...prev[bookingId], [field]: originalValue },
          };
        }
        return prev;
      });
    }, 6000);
  };

  // ===== Update/Delete with series support =====
  const handleUpdateClick = (booking) => {
    setActionBooking(booking);
    setActionType('update');
    setShowConfirm(true);
  };

  const handleDeleteClick = (booking) => {
    setActionBooking(booking);
    setActionType('delete');
    setShowConfirm(true);
  };

  const confirmAction = async (applyToSeries = false) => {
    if (!actionBooking || !actionType) return;
    try {
      if (actionType === 'update') {
        const bookingId = actionBooking.booking_id;
        const edited = editedBookings[bookingId] || {};
        const start_time = edited.start_time || new Date(actionBooking.start_time);
        const end_time = edited.end_time || new Date(actionBooking.end_time);

        await updateBooking(
          actionBooking.room_id,
          actionBooking.booking_id,
          start_time,
          end_time,
          applyToSeries,
        );
      } else if (actionType === 'delete') {
        await deleteBooking(actionBooking.booking_id, applyToSeries);
      }

      fetchData();
      setEditedBookings((prev) => {
        const { [actionBooking.booking_id]: removed, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error(`${actionType} failed:`, err);
      toast.error(`${actionType} failed`);
    } finally {
      setActionBooking(null);
      setActionType(null);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading bookings...
      </div>
    );
  }

  const roomOptions = bookings.map((room) => ({
    value: room.room_id,
    label: room.room_name || 'Unnamed Room',
  }));

  return (
    <div className="max-h-[90vh] lg:h-screen overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-8 bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] py-10 px-4 sm:px-6 lg:px-8">
      <div id="datepicker-portal z-1000"></div>
      <div id="select-room-portal"></div>
      <div id="select-view-portal"></div>
      <div className="max-w-5xl mx-auto">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3 p-4 bg-white/50 backdrop-blur-lg rounded-2xl shadow-md border border-white/30">
          <div className="flex gap-2 flex-wrap">
            {['today', 'upcoming'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${
                  filter === f ? 'bg-[#7a5c45] text-white' : 'bg-white border border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <Select
            options={roomOptions}
            value={roomOptions.find((option) => option.value === selectedRoomId) || null}
            onChange={(option) => setSelectedRoomId(option ? option.value : 'all')}
            placeholder="All Rooms"
            isClearable
            styles={{ ...customStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            className="min-w-[150px]"
            menuPortalTarget={document.body}
          />

          {user.role === 'Super Admin' && (
            <Select
              options={viewOptions}
              value={viewOptions.find((opt) => opt.value === bookingView)}
              onChange={(option) => setBookingView(option ? option.value : 'my')}
              placeholder="View Bookings"
              styles={{ ...customStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              className="min-w-[150px]"
              menuPortalTarget={document.body}
            />
          )}

          <DatePicker
            selected={fromDate}
            onChange={(date) => {
              setFromDate(date);
              setFilter('range');
            }}
            showTimeSelect
            dateFormat="dd MMM h:mm aa"
            placeholderText="From"
            className="border border-gray-300 p-2 rounded-lg w-[140px]"
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
            dateFormat="dd MMM h:mm aa"
            placeholderText="To"
            className="border border-gray-300 p-2 rounded-lg w-[140px]"
            popperPlacement="bottom-start"
            portalId="datepicker-portal"
          />

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
        {!hasBookings ? (
          <p className="text-gray-500 text-center text-lg">No bookings found.</p>
        ) : (
          bookings.map((room) => (
            <div
              key={room.room_id}
              className="bg-white/50 backdrop-blur-lg shadow-md rounded-2xl p-4 sm:p-6 border border-white/30 mb-6"
            >
              <h2 className="text-xl font-semibold text-[#3c2f2f] mb-4 flex items-center gap-2">
                <MdEvent className="text-[#7a5c45]" /> {room.room_name || 'Unnamed Room'}
              </h2>

              <div className="space-y-4 overflow-x-auto">
                {room.bookings.map((b) => {
                  const edited = normalizeBooking(b);
                  const isOwnBooking = b.booked_by === user.name;
                  const isStartTimeInPast = new Date(edited.start_time) <= new Date();
                  const isEndTimePassed = new Date(edited.end_time) <= new Date();

                  return (
                    <div
                      key={b.booking_id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex-1 min-w-[180px] text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Booked by:</span> {b.booked_by || 'Unknown'}
                        </p>
                        <p>
                          <span className="font-medium">From:</span> {formatDate(edited.start_time)}{' '}
                          {formatTime(edited.start_time)}
                        </p>
                        <p>
                          <span className="font-medium">To:</span> {formatDate(edited.end_time)}{' '}
                          {formatTime(edited.end_time)}
                        </p>
                      </div>

                      {(isOwnBooking || user.role==='Super Admin') && (
                        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                          <DatePicker
                            selected={
                              editedBookings[b.booking_id]?.start_time ?? new Date(b.start_time)
                            }
                            onChange={(date) =>
                              handleDateChange(
                                b.booking_id,
                                'start_time',
                                date,
                                new Date(b.start_time),
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
                                : new Date().setHours(0, 0, 0, 0)
                            }
                            maxTime={new Date().setHours(23, 45, 0, 0)}
                            disabled={isStartTimeInPast}
                            popperPlacement="bottom-start"
                            portalId="datepicker-portal"
                          />

                          <DatePicker
                            selected={
                              editedBookings[b.booking_id]?.end_time ?? new Date(b.end_time)
                            }
                            onChange={(date) =>
                              handleDateChange(b.booking_id, 'end_time', date, new Date(b.end_time))
                            }
                            showTimeSelect
                            dateFormat="d MMM yyyy h:mm aa"
                            className="border border-gray-300 p-2 rounded-lg w-full sm:w-44"
                            minDate={edited.start_time}
                            minTime={new Date(edited.start_time.getTime() + 30 * 60 * 1000)}
                            maxTime={new Date().setHours(23, 45, 0, 0)}
                            disabled={isStartTimeInPast}
                            popperPlacement="bottom-start"
                            portalId="datepicker-portal"
                          />

                          {!isStartTimeInPast && (
                            <>
                              <button
                                onClick={() => {
                                  const bookingId = b.booking_id;
                                  const edited = editedBookings[bookingId];
                                  const originalStart = new Date(b.start_time).getTime();
                                  const originalEnd = new Date(b.end_time).getTime();
                                  const newStart = edited?.start_time
                                    ? new Date(edited.start_time).getTime()
                                    : originalStart;
                                  const newEnd = edited?.end_time
                                    ? new Date(edited.end_time).getTime()
                                    : originalEnd;

                                  // Only show modal if something changed
                                  if (newStart !== originalStart || newEnd !== originalEnd) {
                                    handleUpdateClick(b);
                                  } else {
                                    toast.info('No changes to update.');
                                  }
                                }}
                                disabled={disabledBookings[b.booking_id]}
                                className="px-4 py-2 rounded-lg shadow-md text-sm bg-[#7a5c45] text-white hover:bg-[#9c7353] w-full sm:w-auto"
                              >
                                Update
                              </button>
                            </>
                          )}

                          {!isEndTimePassed && (
                            <button
                              onClick={() => handleDeleteClick(b)}
                              disabled={disabledBookings[b.booking_id]}
                              className="px-4 py-2 rounded-lg shadow-md text-sm bg-[#7a5c45] text-white hover:bg-[#9c7353] w-full sm:w-auto"
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
          ))
        )}

        {/* Pagination */}
        {bookings.length > 0 && (
          <div className="flex justify-center mt-6 items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border transition-all ${
                currentPage === 1 ? 'bg-[#7a726b] text-white ' : 'bg-[#7A5C45] text-white'
              }`}
            >
              Prev
            </button>
              <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded-md border transition-all ${
                currentPage === totalPages || totalPages === 0
                  ? 'bg-[#7a726b] text-white '
                  : 'bg-[#7A5C45] text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && actionBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-[#3c2f2f] mb-4">
              {actionType === 'update' ? 'Update Booking' : 'Delete Booking'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Do you want to {actionType} only this booking or the entire series?
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction(false)}
                className="px-4 py-2 rounded-lg shadow-md text-sm bg-[#7a5c45] text-white hover:bg-[#9c7353]"
              >
                {actionType === 'update' ? 'Update One' : 'Delete One'}
              </button>
              {actionBooking.recurrenceId && (
                <button
                  onClick={() => confirmAction(true)}
                  className="px-4 py-2 rounded-lg shadow-md text-sm bg-[#7a5c45] text-white hover:bg-[#9c7353]"
                >
                  {actionType === 'update' ? 'Update Series' : 'Delete Series'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
