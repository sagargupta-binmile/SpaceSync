import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/context';

function Profile() {
  const { user, manager, fetchManager } = useUserContext();
  const [setManagerName] = useState('');
  
  useEffect(() => {
    if (!user) return;

    if (user.managerId) {
      fetchManager().then(() => {
        const mgr = manager.find((m) => m.id === user.managerId);
        if (mgr) setManagerName(mgr.name);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-200">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] overflow-y-hidden py-4 px-4">
      <div className="max-w-lg mx-auto h-[50vh] bg-white shadow-md dark:bg-gray-800 rounded-xl p-x-8 py-8 ">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#7a5c45] flex items-center justify-center text-3xl font-bold text-white shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[#3c2f2f] dark:text-gray-100">
            {user.name}
          </h2>
          <p className="text-[#3c2f2f] dark:text-gray-300">{user.email}</p>
        </div>

      </div>
    </div>
  );
}

export default Profile;
