import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCdikg-Bwa7PMW_pDMJMwaAYMhdWaPXJq4',
  authDomain: 'kendoai.firebaseapp.com',
  projectId: 'kendoai',
  storageBucket: 'kendoai.firebasestorage.app',
  messagingSenderId: '111598093544',
  appId: '1:111598093544:web:195afb7d44b1ba749c755d',
  measurementId: 'G-YRR40YEX50',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db }; 