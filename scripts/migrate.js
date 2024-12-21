import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { getDatabase, ref, set } from 'firebase/database'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
const rtdb = getDatabase(app)

async function migrateData() {
  try {
    // First migrate users
    const usersSnapshot = await getDocs(collection(firestore, 'users'))
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      await set(ref(rtdb, `users/${userDoc.id}`), {
        email: userData.email,
        displayName: userData.displayName || userData.email,
        photoURL: userData.photoURL || null,
        channels: userData.channels || [],
      })
    }
    
    // Then migrate channels
    const channelsSnapshot = await getDocs(collection(firestore, 'channels'))
    
    for (const channelDoc of channelsSnapshot.docs) {
      const channelData = channelDoc.data()
      const channelId = channelDoc.id
      
      // Convert Firestore Timestamp to ISO string or use current date
      const createdAt = channelData.createdAt?.toDate?.() || new Date()
      
      // Migrate channel data
      await set(ref(rtdb, `channels/${channelId}`), {
        name: channelData.name,
        creatorId: channelData.createdBy,
        createdAt: createdAt.toISOString(),
      })
      
      // Get and migrate messages for this channel
      const messagesSnapshot = await getDocs(collection(firestore, `channels/${channelId}/messages`))
      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data()
        const timestamp = messageData.timestamp?.toDate?.() || new Date()
        
        await set(ref(rtdb, `channels/${channelId}/messages/${messageDoc.id}`), {
          text: messageData.text,
          userId: messageData.userId,
          displayName: messageData.userName || messageData.email || 'Anonymous',
          timestamp: timestamp.getTime(),
        })
      }
      
      // Get and migrate users for this channel
      const channelUsersSnapshot = await getDocs(collection(firestore, 'users'))
      for (const userDoc of channelUsersSnapshot.docs) {
        const userData = userDoc.data()
        if (userData.channels?.includes(channelId)) {
          await set(ref(rtdb, `channels/${channelId}/users/${userDoc.id}`), {
            displayName: userData.displayName || userData.email,
            role: userData.uid === channelData.createdBy ? 'creator' : 'member',
            photoURL: userData.photoURL || null,
          })
        }
      }
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    process.exit()
  }
}

migrateData()
