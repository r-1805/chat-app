import React, { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from './components/Auth'
import Chat from './components/Chat'
import ChannelList from './components/ChannelList'
import UserList from './components/UserList'

function App() {
  const [user, setUser] = useState(null)
  const [currentChannel, setCurrentChannel] = useState(null)

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

  const handleLogin = (user) => {
    setUser(user)
  }

  const handleLogout = () => {
    auth.signOut()
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div className="h-screen flex bg-dark-400 text-gray-100">
      <ChannelList 
        onSelectChannel={setCurrentChannel} 
        currentChannel={currentChannel} 
      />
      <Chat currentChannel={currentChannel} />
      <UserList currentChannel={currentChannel} onLogout={handleLogout} />
    </div>
  )
}

export default App
