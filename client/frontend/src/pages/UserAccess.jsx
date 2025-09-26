import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useUserContext } from '../context/context';

function UserAccess() {
  const { employees, fetchEmployees, toggleBlockUser } = useUserContext();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState({ email: '', name: '' });
  const [isActiveFilter, setIsActiveFilter] = useState(true);

 
  const statusOptions = [
    { value: true, label: 'Active Users' },
    { value: false, label: 'Inactive Users' },
  ];

  
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#7A5C45',
      borderRadius: '0.5rem',
      minHeight: '40px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#7A5C45' },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#7A5C45' : 'white',
      color: state.isSelected ? 'white' : '#3C2F2F',
      '&:hover': { backgroundColor: '#A67C52', color: 'white' },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#3C2F2F',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
    }),
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchEmployees(page, isActiveFilter, search.email, search.name);
      setTotalPages(data.totalPages || 1);
    };
    fetchData();
  }, [page, search.email, search.name, isActiveFilter]);

  const handleClearFilters = () => {
    setSearch({ email: '', name: '' });
    setIsActiveFilter(true);
    setPage(1);
  };

  return (
    <div className="max-h-[90vh] lg:h-screen overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-8 bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/70 backdrop-blur-xl shadow-xl shadow-[#C4B6A6]/40 rounded-3xl w-full h-screen md:max-h-[82vh] overflow-y-auto mb-4 scrollbar-hide p-4 sm:p-8 lg:p-6 border border-[#E0D4C7]">
        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap items-center justify-evenly ">
          <input
            type="text"
            placeholder="Search email"
            className="border rounded-lg p-2 w-[25vw]"
            value={search.email}
            onChange={(e) => {
              setSearch({ ...search, email: e.target.value });
              setPage(1);
            }}
          />
          <input
            type="text"
            placeholder="Search name"
            className="border rounded-lg p-2 w-[25vw]"
            value={search.name}
            onChange={(e) => {
              setSearch({ ...search, name: e.target.value });
              setPage(1);
            }}
          />

          {/* React Select Dropdown */}
          <div className="w-48">
            <Select
              value={statusOptions.find((opt) => opt.value === isActiveFilter)}
              onChange={(selected) => {
                setIsActiveFilter(selected.value);
                setPage(1);
              }}
              options={statusOptions}
              styles={customSelectStyles}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-[#7A5C45] text-white rounded-lg"
          >
            Clear Filters
          </button>
        </div>

        {/* Users List */}
        {employees.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          employees.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm mb-2"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={u.isBlocked}
                  onChange={() => toggleBlockUser(u.email, !u.isBlocked)}
                  className="sr-only peer"
                />
                <div
                  className={`relative w-11 h-6 bg-gray-200 rounded-full peer
      peer-focus:ring-4 peer-focus:ring-[#7A5C45]/50
      dark:peer-focus:ring-[#7A5C45]/80 dark:bg-gray-700
      after:content-[''] after:absolute after:top-0.5 after:left-[2px]
      after:bg-white after:border-gray-300 after:border after:rounded-full
      after:h-5 after:w-5 after:transition-all
      dark:border-gray-600
      peer-checked:after:translate-x-full
      peer-checked:after:border-white
      peer-checked:bg-[#7A5C45]`}
                ></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {u.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </label>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-[#7A5C45] text-white disabled:bg-gray-400"
          >
            Prev
          </button>

          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-[#7A5C45] text-white disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserAccess;
