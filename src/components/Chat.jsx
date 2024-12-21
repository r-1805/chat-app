import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import EmojiGifPicker from './EmojiGifPicker';

export default function Chat({ currentChannel }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiGifPicker, setShowEmojiGifPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!currentChannel) return;

    const q = query(
      collection(db, `channels/${currentChannel.id}/messages`),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [currentChannel]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, `channels/${currentChannel.id}/messages`), {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.email,
        type: newMessage.startsWith('http') ? 'gif' : 'text'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEmojiGifSelect = (content) => {
    if (content.startsWith('http')) {
      // Это GIF
      setNewMessage(content);
      sendMessage();
    } else {
      // Это эмодзи
      setNewMessage(prev => prev + content);
    }
    setShowEmojiGifPicker(false);
  };

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-300">
        <p className="text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-300 relative">
      <div className="border-b border-gray-700 px-6 py-3">
        <h3 className="text-lg font-medium text-white">{currentChannel.name}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === auth.currentUser.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-dark ${
                message.userId === auth.currentUser.uid
                  ? 'bg-accent-blue'
                  : 'bg-dark-100'
              }`}
            >
              <div className="text-sm font-medium mb-1 text-gray-300">
                {message.userName}
              </div>
              {message.type === 'gif' ? (
                <img src={message.text} alt="GIF" className="rounded-md max-w-full" />
              ) : (
                <div className="text-white">{message.text}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-gray-700 p-4">
        <div className="flex space-x-4">
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
            />
            <button
              type="button"
              onClick={() => setShowEmojiGifPicker(!showEmojiGifPicker)}
              className="px-4 py-2 bg-dark-100 text-white rounded-lg hover:bg-dark-200 focus:outline-none transition-colors duration-200"
            >
              😊
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>

      <EmojiGifPicker
        isOpen={showEmojiGifPicker}
        onClose={() => setShowEmojiGifPicker(false)}
        onSelect={handleEmojiGifSelect}
      />
    </div>
  );
}
