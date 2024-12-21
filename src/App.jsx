import React, { useState, useEffect } from 'react'
import { auth, rtdb } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, onValue } from 'firebase/database'
import Chat from './components/Chat'
import ChannelList from './components/ChannelList'
import SearchUsers from './components/SearchUsers'
import UserProfile from './components/UserProfile'
import Login from './components/Login'

/**
 * Main application component that handles authentication and layout
 * @component
 */
function App() {
  // State for managing user authentication, current channel, and user profile
  const [user, setUser] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  /**
   * Effect hook to handle user authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Get user profile from Realtime Database
        const userRef = ref(rtdb, `users/${currentUser.uid}`)
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val()
          if (userData) {
            setUserProfile(userData)
          }
        })
        setUser(currentUser)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Установка тёмной темы по умолчанию
    document.documentElement.classList.add('dark')

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex flex-col w-64">
        <ChannelList
          onSelectChannel={setSelectedChannel}
          currentChannel={selectedChannel}
          currentUser={user}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <Chat channel={selectedChannel} currentUser={userProfile || user} />
      </div>
      <div className="w-64 bg-gray-800 p-4">
        <SearchUsers />
        <div className="mt-4">
          <h2 className="text-xl text-white mb-4">Users in Channel</h2>
          {userProfile && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                {userProfile.photoURL && (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="text-white font-medium">
                    {userProfile.displayName || user.email}
                  </div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => auth.signOut()}
          className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default App
