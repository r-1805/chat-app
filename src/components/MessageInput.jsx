import React, { useState, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

// Предустановленные GIF-ки в стиле Telegram
const PRESET_GIFS = [
  {
    id: '1',
    url: 'https://media1.tenor.com/images/68c06b37b6bd44725b54fb06b856e089/tenor.gif',
    preview: 'https://media1.tenor.com/images/68c06b37b6bd44725b54fb06b856e089/tenor.gif',
    title: 'Hello'
  },
  {
    id: '2',
    url: 'https://media1.tenor.com/images/f8935827d9c11f02e6ef44649e0d8648/tenor.gif',
    preview: 'https://media1.tenor.com/images/f8935827d9c11f02e6ef44649e0d8648/tenor.gif',
    title: 'Thumbs Up'
  },
  {
    id: '3',
    url: 'https://media1.tenor.com/images/9ea72ef078139ced289852e8a4ea0c5c/tenor.gif',
    preview: 'https://media1.tenor.com/images/9ea72ef078139ced289852e8a4ea0c5c/tenor.gif',
    title: 'Laugh'
  },
  {
    id: '4',
    url: 'https://media1.tenor.com/images/2c3668f83f251c47fe4319ed58961898/tenor.gif',
    preview: 'https://media1.tenor.com/images/2c3668f83f251c47fe4319ed58961898/tenor.gif',
    title: 'Think'
  }
];

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ type: 'text', content: message.trim() });
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newMessage = message.substring(0, start) + emoji.native + message.substring(end);
    setMessage(newMessage);
    setShowEmojiPicker(false);
    // Устанавливаем фокус обратно на input
    input.focus();
  };

  const handleGifSelect = (gif) => {
    onSendMessage({ type: 'gif', content: gif.url });
    setShowGifPicker(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-800">
        {/* Кнопка эмодзи */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
          }}
          className="p-2 text-gray-400 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Кнопка GIF */}
        <button
          type="button"
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
          }}
          className="p-2 text-gray-400 hover:text-white focus:outline-none"
        >
          <span className="font-bold">GIF</span>
        </button>

        {/* Поле ввода */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 mx-4 p-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>

      {/* Picker эмодзи */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="dark"
            previewPosition="none"
          />
        </div>
      )}

      {/* Picker GIF */}
      {showGifPicker && (
        <div className="absolute bottom-full mb-2 bg-gray-800 rounded-lg p-4 w-96">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GIFS.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifSelect(gif)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <img
                  src={gif.preview}
                  alt={gif.title}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
