import React, { useEffect, useState } from 'react';
import { useUserContext } from '../context/context';

function Profile() {
  const { user, manager, fetchManager } = useUserContext();
  const [managerName, setManagerName] = useState('');
  //console.log(user);
  useEffect(() => {
    if (!user) return;

    if (user.managerId) {
      fetchManager().then(() => {
        const mgr = manager.find((m) => m.id === user.managerId);
        if (mgr) setManagerName(mgr.name);
      });
    }
  }, [user, manager, fetchManager]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-200">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6efe9] to-[#e7ded6] overflow-y-hidden py-4 px-4">
      <div className="max-w-lg mx-auto h-96 bg-white shadow-md dark:bg-gray-800 rounded-xl p-x-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#7a5c45] flex items-center justify-center text-3xl font-bold text-white shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[#3c2f2f] dark:text-gray-100">
            {user.name}
          </h2>
          <p className="text-[#3c2f2f] dark:text-gray-300">{user.email}</p>
        </div>

        <div
          className={`mt-6 space-y-3 flex items-center ${
            user.managerId ? 'justify-between' : 'justify-center'
          }`}
        >
          <div className="flex">
            <h3 className="text-[#7a5c45] dark:text-gray-300 font-medium mb-1">
              Role:{' '}
            </h3>
            <p className="text-[#3c2f2f] dark:text-gray-100 capitalize ml-1">
              {user.role}
            </p>
          </div>

          {user.managerId && (
            <div className="flex">
              <h3 className="text-[#7a5c45] dark:text-gray-300 font-medium mb-1">
                Manager:
              </h3>
              <p className="text-[#3c2f2f] dark:text-gray-100 ml-1">
                {managerName || 'Loading...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
