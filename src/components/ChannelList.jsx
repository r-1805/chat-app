import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, onValue, push, set, get } from 'firebase/database'

/**
 * Component for displaying and managing chat channels
 * @component
 */
const ChannelList = ({ onSelectChannel, currentChannel, currentUser }) => {
  const [channels, setChannels] = useState([])
  const [newChannelName, setNewChannelName] = useState('')
  const [showNewChannelForm, setShowNewChannelForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Сначала получаем список каналов пользователя
        const userChannelsRef = ref(rtdb, `users/${currentUser.uid}/channels`)
        const userChannelsSnapshot = await get(userChannelsRef)
        const userChannels = userChannelsSnapshot.val() || {}
        
        // Затем получаем все каналы
        const channelsRef = ref(rtdb, 'channels')
        
        const unsubscribe = onValue(channelsRef, async (snapshot) => {
          try {
            const channelsData = snapshot.val()
            if (channelsData) {
              // Фильтруем каналы, оставляя только те, в которых участвует пользователь
              const channelsList = Object.entries(channelsData)
                .filter(([id]) => userChannels[id])
                .map(([id, data]) => ({
                  id,
                  ...data,
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              
              setChannels(channelsList)
            } else {
              setChannels([])
            }
          } catch (err) {
            console.error('Error processing channels data:', err)
            setError('Error loading channels')
          } finally {
            setLoading(false)
          }
        }, (err) => {
          console.error('Channel listener error:', err)
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
  }, [currentUser.uid])

  const createChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      const channelsRef = ref(rtdb, 'channels')
      const newChannelRef = push(channelsRef)
      const channelId = newChannelRef.key
      const timestamp = new Date().toISOString()

      // Создаем канал
      await set(newChannelRef, {
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
      })

      // Добавляем канал в список каналов пользователя
      const userChannelsRef = ref(rtdb, `users/${currentUser.uid}/channels/${channelId}`)
      await set(userChannelsRef, {
        role: 'creator',
        joinedAt: timestamp
      })

      setNewChannelName('')
      setShowNewChannelForm(false)
      
      // Выбираем новый канал
      onSelectChannel({
        id: channelId,
        name: newChannelName.trim(),
        creatorId: currentUser.uid,
        createdAt: timestamp
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      setError('Error creating channel')
    }
  }

  const deleteChannel = async (channelId) => {
    try {
      // Удаляем канал из общего списка
      await set(ref(rtdb, `channels/${channelId}`), null)
      
      // Удаляем канал из списка каналов пользователя
      await set(ref(rtdb, `users/${currentUser.uid}/channels/${channelId}`), null)
      
      // Если текущий канал - это удаляемый канал, сбрасываем выбор
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
        <div className="bg-red-500 text-white p-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {showNewChannelForm && (
        <form onSubmit={createChannel} className="mb-4">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name"
            className="w-full rounded-md border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue mb-2"
          />
          <button
            type="submit"
            className="w-full bg-accent-blue text-white rounded-md py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors duration-200"
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
              <span>{channel.name}</span>
              {channel.creatorId === currentUser.uid && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChannel(channel.id)
                  }}
                  className="text-sm hover:text-red-400 transition-colors duration-200"
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
