import React, { useState } from 'react';
import { auth, rtdb } from '../firebase';
import { ref, update } from 'firebase/database';

const EditProfile = ({ userProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userRef = ref(rtdb, `users/${userProfile.uid}`);
    try {
      await update(userRef, {
        displayName: username,
        bio: bio
      });
      onUpdate && onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Profile</h3>
            <p className="text-gray-400">@{userProfile?.displayName}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-white">{userProfile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Bio</p>
            <p className="text-white">{userProfile?.bio || 'No bio yet'}</p>
          </div>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="@username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Email</label>
          <input
            type="email"
            value={userProfile?.email}
            disabled
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Tell us about yourself"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
