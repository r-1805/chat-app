import React, { useState, useEffect, useRef } from 'react'
import { rtdb } from '../firebase'
import { ref, push, onValue, set } from 'firebase/database'

/**
 * Chat component for displaying and sending messages
 * @component
 */
const Chat = ({ channel, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!channel) return

    const messagesRef = ref(rtdb, `channels/${channel.id}/messages`)
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val()
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, data]) => ({
          id,
          ...data,
        }))
        setMessages(messagesList)
        scrollToBottom()
      } else {
        setMessages([])
      }
    })

    return () => unsubscribe()
  }, [channel])

  const isGifUrl = (text) => {
    return text.match(/https:\/\/media[0-9]?.giphy.com\/media\/.*\/200.gif/)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !channel) return

    try {
      const messagesRef = ref(rtdb, `channels/${channel.id}/messages`)
      await push(messagesRef, {
        text: newMessage.trim(),
        userId: currentUser.uid,
        displayName: currentUser.email,
        timestamp: Date.now(),
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl text-white">{channel?.name || 'Select a channel'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.userId === currentUser.uid ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === currentUser.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <div className="text-sm opacity-75 mb-1">{message.displayName}</div>
              {isGifUrl(message.text) ? (
                <img src={message.text} alt="GIF" className="rounded-lg max-w-full" />
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={channel ? 'Type your message...' : 'Please select a channel'}
            disabled={!channel}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!channel}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
