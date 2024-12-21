import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Profile({ onClose }) {
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    tag: '',
    avatarUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...profile,
        lastUpdated: new Date()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-64 bg-dark-200 p-4 border-l border-gray-700 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-white">Profile</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-100 mb-2">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">
                {profile.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-2 right-0 bg-accent-blue text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              +
            </label>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Display Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white"
            />
          ) : (
            <p className="text-white">{profile.displayName}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Tag</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.tag}
              onChange={(e) => setProfile(prev => ({ ...prev, tag: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value }))}
              placeholder="@username"
              className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white"
            />
          ) : (
            <p className="text-white">{profile.tag || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Bio</label>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white resize-none"
              rows="3"
            />
          ) : (
            <p className="text-white">{profile.bio || 'No bio yet'}</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="w-full bg-accent-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="w-full bg-dark-100 text-white p-2 rounded-lg hover:bg-dark-300 transition-colors duration-200"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-dark-100 text-white p-2 rounded-lg hover:bg-dark-300 transition-colors duration-200"
          >
            Edit Profile
          </button>
        )}
        
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
