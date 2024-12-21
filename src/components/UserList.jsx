import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { rtdb } from '../firebase'
import { ref, onValue, remove } from 'firebase/database'

/**
 * Component for displaying and managing users in a channel
 * @component
 */
const UserList = ({ currentChannel, onLogout, searchQuery, currentUser }) => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!currentChannel) return

    const usersRef = ref(rtdb, `channels/${currentChannel.id}/users`)
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val()
      if (usersData) {
        const usersList = Object.entries(usersData).map(([id, data]) => ({
          id,
          ...data,
        }))
        setUsers(usersList)
      } else {
        setUsers([])
      }
    })

    return () => unsubscribe()
  }, [currentChannel])

  /**
   * Remove user from the current channel
   * @param {string} userId - ID of the user to remove
   */
  const handleRemoveUser = async (userId) => {
    if (!currentChannel || currentUser.uid !== currentChannel.creatorId) return
    if (userId === currentUser.uid) return // Cannot remove yourself

    try {
      await remove(ref(rtdb, `channels/${currentChannel.id}/users/${userId}`))
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-gray-800 w-full h-full p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Users in Channel</h2>
      <ul className="space-y-2">
        {filteredUsers.map(user => (
          <li key={user.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span>{user.displayName}</span>
            {currentChannel?.creatorId === currentUser.uid && user.id !== currentUser.uid && (
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={onLogout}
        className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  )
}

UserList.propTypes = {
  currentChannel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    creatorId: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
}

export default UserList
