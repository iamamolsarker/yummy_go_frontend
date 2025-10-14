// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useMemo, useEffect } from 'react';
// import { Search, Ban, CheckCircle2,  Edit, XCircle, ServerCrash, UtensilsCrossed } from 'lucide-react';

// // --- Constants and Types ---
// const API_BASE_URL = 'https://yummy-go-server.vercel.app/api';

// type UserRole = 'admin' | 'user' | 'rider' | 'restaurant_owner';
// type UserStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'suspended';

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   photoURL?: string;
//   role: UserRole;
//   status: UserStatus;
//   created_at: string;
// }

// // --- Helper Functions ---
// const getStatusDisplay = (status?: UserStatus): { text: string; className: string } => {
//   const safeStatus = status ? status.toLowerCase() : 'pending';
//   switch (safeStatus) {
//     case 'active':
//     case 'approved':
//       return { text: 'Active', className: 'bg-green-100 text-green-800' };
//     case 'pending':
//       return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
//     case 'suspended':
//       return { text: 'Banned', className: 'bg-red-100 text-red-800' };
//     case 'rejected':
//       return { text: 'Rejected', className: 'bg-gray-200 text-gray-800' };
//     default:
//       return { text: 'Unknown', className: 'bg-gray-200 text-gray-800' };
//   }
// };

// const getInitials = (name: string = ''): string => {
//   if (!name) return '?';
//   const words = name.trim().split(' ');
//   if (words.length > 1) {
//     return (words[0][0] + words[words.length - 1][0]).toUpperCase();
//   }
//   return name.substring(0, 2).toUpperCase();
// };


// // --- Main Component ---
// export default function UserManagement() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'active' | 'suspended' | 'rejected'>('All');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const response = await fetch(`${API_BASE_URL}/users`);
//         if (!response.ok) throw new Error('Failed to fetch users. Please check API server.');

//         const apiResponse = await response.json();
//         const userList = Array.isArray(apiResponse.data) ? apiResponse.data : [];

//         const usersWithDefaults = userList.map((user: { status: any; }) => ({
//           ...user,
//           status: user.status || 'pending',
//         }));
//         setUsers(usersWithDefaults);

//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setTimeout(() => setIsLoading(false), 500);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const filteredUsers = useMemo(() => {
//     return users
//       .filter(user => statusFilter === 'All' || user.status === statusFilter)
//       .filter(user =>
//         (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
//       );
//   }, [users, statusFilter, searchTerm]);

//   const handleUserUpdate = async (
//     email: string,
//     updateData: { role?: UserRole; status?: UserStatus }
//   ) => {
//     const isRoleUpdate = 'role' in updateData;
//     const endpoint = isRoleUpdate
//       ? `${API_BASE_URL}/users/${email}/role`
//       : `${API_BASE_URL}/users/${email}/status`;

//     const body = isRoleUpdate ? { role: updateData.role } : { status: updateData.status };

//     setActiveActionMenu(null);

//     try {
//       const response = await fetch(endpoint, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update user.');
//       }

//       setUsers(prevUsers =>
//         prevUsers.map(user =>
//           user.email === email ? { ...user, ...updateData } : user
//         )
//       );
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
//         <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
//         <p className="mt-4 text-lg font-semibold">Fetching Fresh Data...</p>
//         <p className="text-sm">Please wait a moment.</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 p-4">
//         <ServerCrash className="text-red-500 mb-4" size={48} />
//         <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
//         <p className="text-gray-500 max-w-md">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>

//         <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-grow">
//               <div className="flex space-x-1 border border-gray-200 rounded-lg p-1">
//                 {(['All', 'active', 'pending', 'suspended', 'rejected'] as const).map(tab => (
//                   <button
//                     key={tab}
//                     onClick={() => setStatusFilter(tab)}
//                     // --- Updated Class for Active Tab Color ---
//                     className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 capitalize ${statusFilter === tab ? 'bg-[#EF451C] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
//                   >
//                     {tab}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="relative min-w-[250px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
//               <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF451C]/50" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-md">
//           <table className="min-w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
//                 <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.map((user) => {
//                 const displayStatus = getStatusDisplay(user.status);
//                 return (
//                   <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {user.photoURL ? (
//                           <img className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-2 ring-gray-100" src={user.photoURL} alt={user.name} />
//                         ) : (
//                           <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-gray-100">
//                             <span className="text-sm font-bold text-gray-600">{getInitials(user.name)}</span>
//                           </div>
//                         )}
//                         <div className="ml-4">
//                           <div className="text-sm font-semibold text-gray-900">{user.name}</div>
//                           <div className="text-sm text-gray-500">{user.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{user.role.replace('_', ' ')}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${displayStatus.className}`}>
//                         {displayStatus.text}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
//                       <div className="flex items-center justify-center space-x-2">
//                         {user.status === 'pending' && (
//                           <>
//                             <button onClick={() => handleUserUpdate(user.email, { status: 'active' })} className="bg-green-100 text-green-800 hover:bg-green-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
//                                 <CheckCircle2 size={14} className="mr-1" /> Approve
//                             </button>
//                             <button onClick={() => handleUserUpdate(user.email, { status: 'rejected' })} className="bg-red-100 text-red-800 hover:bg-red-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
//                                 <XCircle size={14} className="mr-1" /> Reject
//                             </button>
//                           </>
//                         )}

//                         {(user.status === 'active' || user.status === 'approved') && (
//                           <>
//                             <div className="relative">
//                                 <button onClick={() => setActiveActionMenu(activeActionMenu === user._id ? null : user._id)} className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
//                                     <Edit size={14} className="mr-1" /> Change Role
//                                 </button>
//                                 {activeActionMenu === user._id && (
//                                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                                         <div className="py-1">
//                                             {(['admin', 'rider', 'restaurant_owner'] as const).map(role => (
//                                                 <a key={role} href="#" onClick={(e) => { e.preventDefault(); handleUserUpdate(user.email, { role }); }} 
//                                                    // --- Updated Class for Dropdown Item Color ---
//                                                    className={`block px-4 py-2 text-sm capitalize transition-colors duration-200 ${user.role === role ? 'bg-[#EF451C] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
//                                                     {role.replace('_', ' ')}
//                                                 </a>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                             <button onClick={() => handleUserUpdate(user.email, { status: 'suspended' })} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
//                                 <Ban size={14} className="mr-1" /> Ban
//                             </button>
//                           </>
//                         )}

//                         {(user.status === 'suspended' || user.status === 'rejected') && (
//                             <button onClick={() => handleUserUpdate(user.email, { status: 'active' })} className="bg-green-100 text-green-800 hover:bg-green-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
//                                 <CheckCircle2 size={14} className="mr-1" /> Re-Activate
//                             </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//           {filteredUsers.length === 0 && !isLoading && (
//             <div className="text-center py-12 text-gray-500">
//               <p>No users found matching your criteria.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }







// File Path: src/pages/Dashboard/UserManagement.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { Search, Ban, CheckCircle2, Edit, XCircle, ServerCrash, UtensilsCrossed } from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

// --- Type and Interface Definitions ---
type UserRole = 'admin' | 'user' | 'rider' | 'restaurant_owner';
type UserStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'suspended';

interface User {
  _id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

// --- Helper Functions (Unchanged) ---
const getStatusDisplay = (status?: UserStatus): { text: string; className: string } => {
  const safeStatus = status ? status.toLowerCase() : 'pending';
  switch (safeStatus) {
    case 'active':
    case 'approved':
      return { text: 'Active', className: 'bg-green-100 text-green-800' };
    case 'pending':
      return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
    case 'suspended':
      return { text: 'Banned', className: 'bg-red-100 text-red-800' };
    case 'rejected':
      return { text: 'Rejected', className: 'bg-gray-200 text-gray-800' };
    default:
      return { text: 'Unknown', className: 'bg-gray-200 text-gray-800' };
  }
};

const getInitials = (name: string = ''): string => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// --- Main Component ---
export default function UserManagement() {
  // --- State Declarations ---
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'active' | 'suspended' | 'rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Get the configured axios instance from the custom hook
  const axiosSecure = useAxiosSecure();

  // --- useEffect for fetching initial data ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 3. Use axiosSecure.get to fetch users with authentication headers
        const response = await axiosSecure.get('/users');

        // axios provides JSON data directly in response.data
        const userList = Array.isArray(response.data.data) ? response.data.data : [];

        // Set a default status of 'pending' if it's missing
        const usersWithDefaults = userList.map((user: any) => ({
          ...user,
          status: user.status || 'pending',
        }));
        setUsers(usersWithDefaults);

      } catch (err: any) {
        // Handle errors from the API call
        setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
      } finally {
        // Add a small delay to prevent UI flashing
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // The hook's returned function is stable, no need to add it as a dependency.

  // --- useMemo for memoizing the filtered user list ---
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => statusFilter === 'All' || user.status === statusFilter)
      .filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
  }, [users, statusFilter, searchTerm]);

  // --- Function to handle user updates (role or status) ---
  const handleUserUpdate = async (
    email: string,
    updateData: { role?: UserRole; status?: UserStatus }
  ) => {
    const isRoleUpdate = 'role' in updateData;
    const endpoint = isRoleUpdate ? `/users/${email}/role` : `/users/${email}/status`;
    const body = isRoleUpdate ? { role: updateData.role } : { status: updateData.status };

    setActiveActionMenu(null); // Close the dropdown menu after selection

    try {
      // 4. Use axiosSecure.patch to send an authenticated update request
      await axiosSecure.patch(endpoint, body);

      // Update the local state immediately to reflect the change in the UI
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.email === email ? { ...user, ...updateData } : user
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update user.');
    }
  };

  // --- Loading UI ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Fetching Fresh Data...</p>
        <p className="text-sm">Please wait a moment.</p>
      </div>
    );
  }

  // --- Error UI ---
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  // --- Main UI (JSX) ---
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>

        {/* --- Filter and Search Bar --- */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="flex space-x-1 border border-gray-200 rounded-lg p-1">
                {(['All', 'active', 'pending', 'suspended', 'rejected'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 capitalize ${statusFilter === tab ? 'bg-[#EF451C] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF451C]/50" />
            </div>
          </div>
        </div>

        {/* --- Users Table --- */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const displayStatus = getStatusDisplay(user.status);
                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* User Info Cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <img className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-2 ring-gray-100" src={user.photoURL} alt={user.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-gray-100">
                            <span className="text-sm font-bold text-gray-600">{getInitials(user.name)}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{user.role.replace('_', ' ')}</td>
                    {/* Status Cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${displayStatus.className}`}>
                        {displayStatus.text}
                      </span>
                    </td>
                    {/* Actions Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Actions for 'pending' users */}
                        {user.status === 'pending' && (
                          <>
                            <button onClick={() => handleUserUpdate(user.email, { status: 'active' })} className="bg-green-100 text-green-800 hover:bg-green-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
                              <CheckCircle2 size={14} className="mr-1" /> Approve
                            </button>
                            <button onClick={() => handleUserUpdate(user.email, { status: 'rejected' })} className="bg-red-100 text-red-800 hover:bg-red-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
                              <XCircle size={14} className="mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {/* Actions for 'active' or 'approved' users */}
                        {(user.status === 'active' || user.status === 'approved') && (
                          <>
                            <div className="relative">
                              <button onClick={() => setActiveActionMenu(activeActionMenu === user._id ? null : user._id)} className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
                                <Edit size={14} className="mr-1" /> Change Role
                              </button>
                              {activeActionMenu === user._id && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    {(['admin', 'rider', 'restaurant_owner'] as const).map(role => (
                                      <a key={role} href="#" onClick={(e) => { e.preventDefault(); handleUserUpdate(user.email, { role }); }}
                                        className={`block px-4 py-2 text-sm capitalize transition-colors duration-200 ${user.role === role ? 'bg-[#EF451C] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        {role.replace('_', ' ')}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button onClick={() => handleUserUpdate(user.email, { status: 'suspended' })} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
                              <Ban size={14} className="mr-1" /> Ban
                            </button>
                          </>
                        )}
                        {/* Actions for 'suspended' or 'rejected' users */}
                        {(user.status === 'suspended' || user.status === 'rejected') && (
                          <button onClick={() => handleUserUpdate(user.email, { status: 'active' })} className="bg-green-100 text-green-800 hover:bg-green-200 font-bold py-2 px-3 rounded-md inline-flex items-center text-xs transition-all duration-200 hover:scale-105 shadow-sm">
                            <CheckCircle2 size={14} className="mr-1" /> Re-Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* Message to display if no users are found */}
          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}