import React, { useState, useEffect, useRef } from 'react'
import { rtdb } from '../firebase'
import { ref, push, onValue, set } from 'firebase/database'
import MessageInput from './MessageInput'

/**
 * Chat component for displaying and sending messages
 * @component
 */
const Chat = ({ channel, currentUser }) => {
  const [messages, setMessages] = useState([])
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

  const handleSendMessage = async (messageData) => {
    if (!channel) return

    const messagesRef = ref(rtdb, `channels/${channel.id}/messages`)
    try {
      await push(messagesRef, {
        ...messageData,
        userId: currentUser.uid,
        timestamp: Date.now(),
        userName: currentUser.displayName || currentUser.email,
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const isGifUrl = (text) => {
    return text.match(/https:\/\/media[0-9]?.giphy.com\/media\/.*\/200.gif/)
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl text-white">{channel?.name || 'Select a channel'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {channel ? (
          <div className="space-y-4">
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
                  <div className="text-sm opacity-75 mb-1">{message.userName}</div>
                  {isGifUrl(message.text) ? (
                    <img src={message.text} alt="GIF" className="rounded-lg max-w-full" />
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a channel to start chatting</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {channel && (
        <div className="p-4 border-t border-gray-800">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  )
}

export default Chat
