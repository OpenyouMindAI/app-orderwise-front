// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCgvmBhUCkbQLLIrgfjWhtAJ-kxSxoV6Ys',
  authDomain: 'shopping-b3b65.firebaseapp.com',
  projectId: 'shopping-b3b65',
  storageBucket: 'shopping-b3b65.appspot.com',
  messagingSenderId: '928043269700',
  appId: '1:928043269700:web:9fc5329f728a53dc8f0611',
  measurementId: 'G-XNZ6W9068V'
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const auth = getAuth(app)
