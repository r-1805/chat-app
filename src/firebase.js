import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getDatabase, connectDatabaseEmulator, ref, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
}

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***HIDDEN***'
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Get Auth instance
const auth = getAuth(app)

// Get Realtime Database instance
const rtdb = getDatabase(app)

// Enable database persistence
try {
  const connectedRef = ref(rtdb, '.info/connected')
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log('Connected to Firebase')
    } else {
      console.log('Not connected to Firebase')
    }
  })
} catch (error) {
  console.error('Error setting up connection monitoring:', error)
}

// Use emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectDatabaseEmulator(rtdb, 'localhost', 9000)
    console.log('Connected to Firebase emulators')
  } catch (error) {
    console.error('Error connecting to emulators:', error)
  }
}

export { auth, rtdb }
