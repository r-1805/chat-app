import { useState, useEffect } from 'react';
import axios from 'axios';

// Используем бесплатный API для эмодзи
const COMMON_EMOJIS = [
  '😊', '😂', '🤣', '❤️', '😍', '🥰', '😘', '😭', 
  '😅', '😉', '🙂', '🤔', '🤗', '🤫', '🤐', '😶',
  '😄', '😃', '😀', '😊', '☺️', '😌', '😏', '😎',
  '👍', '👎', '👌', '✌️', '🤞', '🤙', '👋', '🤚',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭'
];

const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Это тестовый ключ Giphy API

export default function EmojiGifPicker({ onSelect, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('emoji');
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'gif' && searchTerm) {
      fetchGifs();
    }
  }, [searchTerm, activeTab]);

  const fetchGifs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=20&rating=g`
      );
      setGifs(response.data.data);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 right-4 w-96 bg-dark-200 rounded-lg shadow-dark-lg border border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === 'emoji'
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:bg-dark-100'
              }`}
              onClick={() => setActiveTab('emoji')}
            >
              Emojis
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === 'gif'
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:bg-dark-100'
              }`}
              onClick={() => setActiveTab('gif')}
            >
              GIFs
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {activeTab === 'gif' && (
          <input
            type="text"
            placeholder="Search GIFs..."
            className="w-full px-4 py-2 rounded-md bg-dark-100 border border-gray-700 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue mb-4"
            value={searchTerm}
            onChange={handleSearch}
          />
        )}

        <div className="h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {activeTab === 'emoji' ? (
                COMMON_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(emoji)}
                    className="p-2 text-2xl hover:bg-dark-100 rounded transition-colors duration-200"
                  >
                    {emoji}
                  </button>
                ))
              ) : (
                gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => onSelect(gif.images.fixed_height.url)}
                    className="relative aspect-square overflow-hidden rounded hover:opacity-80 transition-opacity duration-200"
                  >
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
