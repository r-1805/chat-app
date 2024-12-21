import React from 'react'
import PropTypes from 'prop-types'

const UserProfile = ({ user }) => {
  if (!user) return null

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="text-white font-medium">
            {user.displayName || user.email}
          </div>
          <div className="text-gray-400 text-sm">{user.email}</div>
        </div>
      </div>
    </div>
  )
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    photoURL: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
}

export default UserProfile
