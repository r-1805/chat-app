# Real-time Chat Application

A modern real-time chat application built with React, Firebase, and Socket.IO.

## Features

- Real-time messaging
- Channel creation and management
- User authentication
- User search functionality
- Channel member management
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase configuration
   - Update the configuration in `src/firebase.js`

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Register a new account or login with existing credentials
2. Create a new channel or join an existing one
3. Start chatting with other users
4. Search for users using the search functionality
5. Channel creators can manage channel members

## Technologies Used

- React.js
- Firebase (Authentication & Firestore)
- Tailwind CSS
- Socket.IO

## Project Structure

```
chat-app/
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── Chat.jsx
│   │   ├── ChannelList.jsx
│   │   └── UserList.jsx
│   ├── App.jsx
│   ├── firebase.js
│   └── index.css
├── public/
└── package.json
