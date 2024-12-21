import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function ChannelList({ onSelectChannel, currentChannel }) {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'channels'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelList = [];
      snapshot.forEach((doc) => {
        channelList.push({ id: doc.id, ...doc.data() });
      });
      setChannels(channelList);
    });

    return () => unsubscribe();
  }, []);

  const createChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await addDoc(collection(db, 'channels'), {
        name: newChannelName,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setNewChannelName('');
      setShowNewChannelForm(false);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const deleteChannel = async (channelId) => {
    try {
      await deleteDoc(doc(db, 'channels', channelId));
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  };

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
        {channels.map((channel) => (
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
            {channel.createdBy === auth.currentUser.uid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChannel(channel.id);
                }}
                className="text-sm hover:text-red-400 transition-colors duration-200"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
