import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, onValue, push, set, get, serverTimestamp } from 'firebase/database'

const ChannelList = ({ onSelectChannel, currentChannel, currentUser }) => {
  const [channels, setChannels] = useState([])
  const [newChannelName, setNewChannelName] = useState('')
  const [showNewChannelForm, setShowNewChannelForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!currentUser?.uid) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    const loadChannels = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading channels for user:', currentUser.uid)
        
        // Подписываемся на изменения в списке каналов пользователя
        const userChannelsRef = ref(rtdb, `users/${currentUser.uid}/channels`)
        
        const unsubscribe = onValue(userChannelsRef, async (snapshot) => {
          try {
            const userChannels = snapshot.val() || {}
            console.log('User channels:', Object.keys(userChannels).length)
            
            // Подписываемся на изменения в каналах
            const channelsRef = ref(rtdb, 'channels')
            const unsubscribeChannels = onValue(channelsRef, (channelsSnapshot) => {
              try {
                const channelsData = channelsSnapshot.val() || {}
                console.log('All channels:', Object.keys(channelsData).length)
                
                // Фильтруем и преобразуем данные
                const channelsList = Object.entries(channelsData)
                  .filter(([id]) => userChannels[id])
                  .map(([id, data]) => ({
                    id,
                    ...data,
                    role: userChannels[id]?.role
                  }))
                  .sort((a, b) => {
                    const aTime = a.lastMessage?.timestamp || a.createdAt
                    const bTime = b.lastMessage?.timestamp || b.createdAt
                    return new Date(bTime) - new Date(aTime)
                  })
                
                console.log('Filtered channels:', channelsList.length)
                setChannels(channelsList)
                setLoading(false)
              } catch (err) {
                console.error('Error processing channels data:', err)
                setError('Error loading channels')
                setLoading(false)
              }
            })
            
            return () => unsubscribeChannels()
          } catch (err) {
            console.error('Error processing user channels:', err)
            setError('Error loading channels')
            setLoading(false)
          }
        }, (err) => {
          console.error('User channels listener error:', err)
          setError('Error loading channels')
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (err) {
        console.error('Error setting up channels listener:', err)
        setError('Error loading channels')
        setLoading(false)
      }
    }

    loadChannels()
  }, [currentUser?.uid])

  const createChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim() || !currentUser?.uid) return

    try {
      setError(null)
      const timestamp = serverTimestamp()

      // 1. Создаем новый канал
      const channelsRef = ref(rtdb, 'channels')
      const newChannelRef = push(channelsRef)
      const channelId = newChannelRef.key

      const channelData = {
        name: newChannelName.trim(),
        creatorId: currentUser.uid,
        createdAt: timestamp,
        lastMessage: null,
        users: {
          [currentUser.uid]: {
            displayName: currentUser.displayName || currentUser.email,
            role: 'creator',
            joinedAt: timestamp
          }
        }
      }

      // 2. Добавляем канал в общий список
      await set(newChannelRef, channelData)
      console.log('Channel created:', channelId)

      // 3. Добавляем канал в список каналов пользователя
      const userChannelRef = ref(rtdb, `users/${currentUser.uid}/channels/${channelId}`)
      await set(userChannelRef, {
        role: 'creator',
        joinedAt: timestamp
      })
      console.log('Channel added to user channels')

      setNewChannelName('')
      setShowNewChannelForm(false)

      // 4. Выбираем новый канал
      onSelectChannel({
        id: channelId,
        ...channelData
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      setError('Error creating channel')
    }
  }

  const deleteChannel = async (channelId) => {
    if (!currentUser?.uid) return

    try {
      setError(null)
      
      // 1. Проверяем права на удаление
      const channelRef = ref(rtdb, `channels/${channelId}`)
      const channelSnapshot = await get(channelRef)
      const channelData = channelSnapshot.val()

      if (channelData?.creatorId !== currentUser.uid) {
        setError('You do not have permission to delete this channel')
        return
      }

      // 2. Удаляем канал из общего списка
      await set(channelRef, null)
      console.log('Channel deleted:', channelId)

      // 3. Удаляем канал из списков всех пользователей
      const usersRef = ref(rtdb, 'users')
      const usersSnapshot = await get(usersRef)
      const users = usersSnapshot.val() || {}

      const deletePromises = Object.keys(users).map(uid => {
        const userChannelRef = ref(rtdb, `users/${uid}/channels/${channelId}`)
        return set(userChannelRef, null)
      })

      await Promise.all(deletePromises)
      console.log('Channel removed from all users')

      // 4. Если был выбран удаленный канал, сбрасываем выбор
      if (currentChannel?.id === channelId) {
        onSelectChannel(null)
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
      setError('Error deleting channel')
    }
  }

  return (
    <div className="w-64 bg-dark-200 p-4 flex flex-col h-full border-r border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Channels</h2>
        <button
          onClick={() => setShowNewChannelForm(!showNewChannelForm)}
          className="text-accent-blue hover:text-blue-400 transition-colors duration-200 text-xl font-bold"
        >
          {showNewChannelForm ? '×' : '+'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded-md mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null)
              setRetryCount(prev => prev + 1)
            }}
            className="text-sm underline hover:no-underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {showNewChannelForm && (
        <form onSubmit={createChannel} className="mb-4">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name"
            className="w-full rounded-md border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue mb-2 p-2"
          />
          <button
            type="submit"
            disabled={!newChannelName.trim()}
            className="w-full bg-accent-blue text-white rounded-md py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Channel
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <div className="text-sm text-gray-400">Loading channels...</div>
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No channels yet. Create one to start chatting!
          </div>
        ) : (
          channels.map((channel) => (
            <div
              key={channel.id}
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                currentChannel?.id === channel.id
                  ? 'bg-accent-blue text-white'
                  : 'hover:bg-dark-100 text-gray-300'
              }`}
              onClick={() => onSelectChannel(channel)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{channel.name}</div>
                {channel.lastMessage && (
                  <div className="text-xs text-gray-400 truncate">
                    {channel.lastMessage.senderName}: {channel.lastMessage.text}
                  </div>
                )}
              </div>
              {channel.creatorId === currentUser.uid && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChannel(channel.id)
                  }}
                  className="ml-2 text-sm hover:text-red-400 transition-colors duration-200"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

ChannelList.propTypes = {
  onSelectChannel: PropTypes.func.isRequired,
  currentChannel: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  currentUser: PropTypes.object.isRequired,
}

export default ChannelList
