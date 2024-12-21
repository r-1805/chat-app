import React, { useState, useEffect, lazy, Suspense } from 'react'
import { auth, rtdb } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, onValue, set } from 'firebase/database'

// Ленивая загрузка компонентов
const Chat = lazy(() => import('./components/Chat'))
const ChannelList = lazy(() => import('./components/ChannelList'))
const SearchUsers = lazy(() => import('./components/SearchUsers'))
const EditProfile = lazy(() => import('./components/EditProfile'))
const Login = lazy(() => import('./components/Login'))

// Компонент загрузки
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <div className="text-white text-lg">Loading...</div>
    </div>
  </div>
)

function App() {
  const [user, setUser] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [channelUsers, setChannelUsers] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(rtdb, `users/${currentUser.uid}`)
        
        try {
          const unsubscribeProfile = onValue(userRef, 
            (snapshot) => {
              const userData = snapshot.val()
              if (userData) {
                setUserProfile({
                  ...userData,
                  uid: currentUser.uid,
                })
              } else {
                const newProfile = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.email.split('@')[0],
                  photoURL: null,
                  bio: '',
                  channels: [],
                }
                
                set(userRef, newProfile)
                  .then(() => {
                    setUserProfile(newProfile)
                  })
                  .catch((error) => {
                    console.error('Error creating profile:', error)
                  })
              }
              setLoading(false)
            },
            (error) => {
              console.error('Profile listener error:', error)
              setLoading(false)
            }
          )
          
          setUser(currentUser)
          return () => unsubscribeProfile()
        } catch (error) {
          console.error('Profile setup error:', error)
          setLoading(false)
        }
      } else {
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      const channelUsersRef = ref(rtdb, `channels/${selectedChannel.id}/users`)
      const unsubscribe = onValue(channelUsersRef, (snapshot) => {
        const usersData = snapshot.val()
        if (usersData) {
          const usersList = Object.entries(usersData).map(([uid, data]) => ({
            uid,
            ...data
          }))
          setChannelUsers(usersList)
        } else {
          setChannelUsers([])
        }
      })
      return () => unsubscribe()
    } else {
      setChannelUsers([])
    }
  }, [selectedChannel])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Левая панель - список каналов */}
      <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
        <Suspense fallback={<LoadingSpinner />}>
          <ChannelList
            onSelectChannel={setSelectedChannel}
            currentChannel={selectedChannel}
            currentUser={userProfile || user}
          />
        </Suspense>
      </div>

      {/* Центральная панель - чат и список участников */}
      <div className="flex flex-1">
        {/* Чат */}
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<LoadingSpinner />}>
            <Chat channel={selectedChannel} currentUser={userProfile || user} />
          </Suspense>
        </div>

        {/* Список участников канала */}
        {selectedChannel && (
          <div className="w-64 bg-gray-800 border-l border-gray-700">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Channel Members</h3>
              <div className="space-y-2">
                {channelUsers.map((channelUser) => (
                  <div key={channelUser.uid} className="flex items-center text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>{channelUser.displayName}</span>
                    {channelUser.role === 'creator' && (
                      <span className="ml-2 text-xs text-gray-500">(Creator)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Правая панель - профиль и поиск */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Suspense fallback={<LoadingSpinner />}>
            <EditProfile 
              userProfile={userProfile} 
              onUpdate={() => {
                // Обновление профиля
              }} 
            />
          </Suspense>
        </div>
        <div className="p-4">
          <Suspense fallback={<LoadingSpinner />}>
            <SearchUsers />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default App
