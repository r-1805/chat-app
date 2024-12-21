import React from 'react'
import PropTypes from 'prop-types'

/**
 * Component for searching users in the chat application
 * @component
 */
const SearchUsers = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

SearchUsers.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
}

export default SearchUsers
