import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUserContext } from '../context/context';
import logo from '../assets/binmilelogo.jfif';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation(); // <--- get current route
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const getUserInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Map routes to dynamic title
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Book Meeting Room';
      case '/bookings':
        return 'Bookings';
      case '/profile':
        return 'Profile';
      default:
        return 'Book Room';
    }
  };

  return (
    <div className=" flex flex-col bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] h-screen overflow-y-hidden">
      <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-lg border-b border-white/30 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-[#3c2f2f] tracking-wide"
          >
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 rounded-full object-cover shadow-md"
            />
            <span>{getTitle()}</span> {/* <-- dynamic title */}
          </Link>

          {/* Menu / User Dropdown */}
          <div className="flex items-center gap-6 text-[#3c2f2f] font-medium relative">
            {user?.name ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-[#7a5c45] text-white flex items-center justify-center font-semibold shadow-md hover:scale-105 transition-transform"
                >
                  {getUserInitials(user.name)}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] text-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/"
                      className="block px-4 py-3 hover:bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] text-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Book a Room
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-3 hover:bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] text-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] text-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (null
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-2">
        <Outlet />
      </main>
    </div>
  );
}
