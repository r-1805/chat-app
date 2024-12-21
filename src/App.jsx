import React, { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from './components/Auth'
import Chat from './components/Chat'
import ChannelList from './components/ChannelList'
import UserList from './components/UserList'
import SearchUsers from './components/SearchUsers'

/**
 * Main application component that handles authentication and layout
 * @component
 */
function App() {
  // State for managing user authentication and current channel
  const [user, setUser] = useState(null)
  const [currentChannel, setCurrentChannel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * Effect hook to handle user authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
        setCurrentChannel(null)
      }
    })

    // Установка тёмной темы по умолчанию
    document.documentElement.classList.add('dark')

    return () => unsubscribe()
  }, [])

  /**
   * Handle user login
   * @param {Object} user - User object returned from Firebase Auth
   */
  const handleLogin = (user) => {
    setUser(user)
  }

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    auth.signOut()
  }

  // Show authentication screen if user is not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div className="h-screen flex bg-dark-400 text-gray-100">
      <ChannelList 
        onSelectChannel={setCurrentChannel} 
        currentChannel={currentChannel}
        currentUser={user} 
      />
      <Chat 
        currentChannel={currentChannel}
        currentUser={user}
      />
      <div className="w-1/4 flex flex-col">
        <SearchUsers 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <UserList 
          currentChannel={currentChannel} 
          onLogout={handleLogout}
          searchQuery={searchQuery}
          currentUser={user}
        />
      </div>
    </div>
  )
}

export default App
