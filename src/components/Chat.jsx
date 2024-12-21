import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, onValue, push, set, serverTimestamp, update } from 'firebase/database'
import MessageInput from './MessageInput'

const Chat = ({ channel, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!channel?.id || !currentUser?.uid) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const messagesRef = ref(rtdb, `channels/${channel.id}/messages`)
    console.log('Subscribing to messages for channel:', channel.id)

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      try {
        const messagesData = snapshot.val()
        if (messagesData) {
          const messagesList = Object.entries(messagesData)
            .map(([id, data]) => ({
              id,
              ...data,
              timestamp: data.timestamp || Date.now()
            }))
            .sort((a, b) => a.timestamp - b.timestamp)

          console.log('Received messages:', messagesList.length)
          setMessages(messagesList)
        } else {
          setMessages([])
        }
      } catch (err) {
        console.error('Error processing messages:', err)
        setError('Error loading messages')
      } finally {
        setLoading(false)
      }
    }, (err) => {
      console.error('Messages listener error:', err)
      setError('Error loading messages')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [channel?.id, currentUser?.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageData) => {
    if (!channel?.id || !currentUser?.uid) return

    try {
      const timestamp = serverTimestamp()
      
      // 1. Добавляем сообщение
      const messagesRef = ref(rtdb, `channels/${channel.id}/messages`)
      const newMessageRef = push(messagesRef)
      await set(newMessageRef, {
        ...messageData,
        timestamp
      })

      // 2. Обновляем lastMessage в канале
      const updates = {}
      updates[`channels/${channel.id}/lastMessage`] = {
        text: messageData.text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp
      }
      await update(ref(rtdb), updates)

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error sending message')
    }
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-100 text-gray-400">
        Select a channel to start chatting
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-dark-200">
        <h2 className="text-lg font-semibold text-white">{channel.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUser.uid
                    ? 'bg-accent-blue text-white'
                    : 'bg-dark-200 text-gray-300'
                }`}
              >
                {message.senderId !== currentUser.uid && (
                  <div className="text-sm text-gray-400 mb-1">{message.senderName}</div>
                )}
                <div>{message.text}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        channelId={channel.id}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

Chat.propTypes = {
  channel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  currentUser: PropTypes.object.isRequired,
}

export default Chat
