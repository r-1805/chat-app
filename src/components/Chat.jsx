import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, onValue, push, serverTimestamp } from 'firebase/database'

/**
 * Chat component for displaying and sending messages
 * @component
 */
const Chat = ({ currentChannel, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!currentChannel) return

    const messagesRef = ref(rtdb, `channels/${currentChannel.id}/messages`)
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val()
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, data]) => ({
          id,
          ...data,
        }))
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp))
        scrollToBottom()
      } else {
        setMessages([])
      }
    })

    return () => unsubscribe()
  }, [currentChannel])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentChannel) return

    try {
      const messagesRef = ref(rtdb, `channels/${currentChannel.id}/messages`)
      await push(messagesRef, {
        text: newMessage.trim(),
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        Select a channel to start chatting
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">{currentChannel.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === currentUser.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === currentUser.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.displayName}
              </div>
              <div>{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

Chat.propTypes = {
  currentChannel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  currentUser: PropTypes.object.isRequired,
}

export default Chat
