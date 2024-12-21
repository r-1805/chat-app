import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Auth from './components/Auth'
import Chat from './components/Chat'
import ChannelList from './components/ChannelList'
import UserList from './components/UserList'
import { Router } from 'react-router-dom'

function App() {
  const [user, setUser] = useState(null)
  const [currentChannel, setCurrentChannel] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    // Установка тёмной темы по умолчанию
    document.documentElement.classList.add('dark')

    return () => unsubscribe()
  }, [])

  if (!user) {
    return <Auth />
  }

  return (
    <Router basename="/chat-app">
      <div className="h-screen flex bg-dark-400 text-gray-100">
        <ChannelList 
          onSelectChannel={setCurrentChannel} 
          currentChannel={currentChannel} 
        />
        <Chat currentChannel={currentChannel} />
        <UserList currentChannel={currentChannel} />
      </div>
    </Router>
  )
}

export default App
