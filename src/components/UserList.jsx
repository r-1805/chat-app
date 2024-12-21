import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Profile from './Profile';

export default function UserList({ currentChannel }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!currentChannel) return;

    const q = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [currentChannel]);

  const removeUser = async (userId) => {
    if (currentChannel?.createdBy !== auth.currentUser.uid) return;
    
    try {
      const channelRef = doc(db, 'channels', currentChannel.id);
      await updateDoc(channelRef, {
        members: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const currentUser = users.find(user => user.id === auth.currentUser?.uid);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentChannel) return null;

  if (showProfile) {
    return <Profile onClose={() => setShowProfile(false)} />;
  }

  return (
    <div className="w-64 bg-dark-200 p-4 border-l border-gray-700">
      {/* Current User Profile Preview */}
      <div 
        className="mb-4 p-3 bg-dark-100 rounded-lg cursor-pointer hover:bg-dark-300 transition-colors duration-200"
        onClick={() => setShowProfile(true)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg">
                {currentUser?.displayName?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {currentUser?.displayName || 'Your Profile'}
            </div>
            <div className="text-xs text-gray-400">
              {currentUser?.tag || 'Click to edit profile'}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
        />
      </div>

      <h3 className="font-medium text-white mb-3">Channel Members</h3>
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 hover:bg-dark-100 rounded-md transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">{user.displayName || user.email}</div>
                  {user.tag && (
                    <div className="text-xs text-gray-400">{user.tag}</div>
                  )}
                </div>
                {currentChannel.createdBy === auth.currentUser.uid && 
                 user.id !== auth.currentUser.uid && (
                  <button
                    onClick={() => removeUser(user.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
