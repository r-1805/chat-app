import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import EmojiPicker from 'emoji-picker-react'
import { BsEmojiSmile } from 'react-icons/bs'

const MessageInput = ({ channelId, currentUser, onSendMessage }) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !channelId || !currentUser?.uid) return

    try {
      const messageData = {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      }

      onSendMessage(messageData)
      
      setMessage('')
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const onEmojiClick = (emojiObject) => {
    if (!inputRef.current) return
    
    const cursor = inputRef.current.selectionStart
    const text = message.slice(0, cursor) + emojiObject.emoji + message.slice(cursor)
    setMessage(text)
    
    // Устанавливаем курсор после эмодзи
    setTimeout(() => {
      inputRef.current.selectionEnd = cursor + emojiObject.emoji.length
    }, 10)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center p-4 bg-dark-200 border-t border-gray-700">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-400 hover:text-white transition-colors duration-200 mr-2"
        >
          <BsEmojiSmile size={20} />
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-dark-100 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="ml-2 bg-accent-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            searchDisabled
            skinTonesDisabled
            width={300}
            height={400}
          />
        </div>
      )}
    </div>
  )
}

MessageInput.propTypes = {
  channelId: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  onSendMessage: PropTypes.func.isRequired,
}

export default MessageInput
