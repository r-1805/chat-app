import { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Auth from './components/Auth'
import Chat from './components/Chat'
import ChannelList from './components/ChannelList'
import UserList from './components/UserList'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

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

  const handleLogout = () => {
    setUser(null)
    setCurrentChannel(null)
  }

  if (!user) {
    return <Auth onLogin={(user) => setUser(user)} />
  }

  return (
    <Router basename="/chat-app">
      <div className="h-screen flex bg-dark-400 text-gray-100">
        <ChannelList 
          onSelectChannel={setCurrentChannel} 
          currentChannel={currentChannel} 
        />
        <Chat currentChannel={currentChannel} />
        <UserList currentChannel={currentChannel} onLogout={handleLogout} />
      </div>
    </Router>
  )
}

export default App
