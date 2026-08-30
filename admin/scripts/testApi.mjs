import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const regularSnapshot = await getDocs(collection(db, "feedback"));
    console.log("Regular:", regularSnapshot.size);
    const overallSnapshot = await getDocs(collection(db, "overallFeedbackData"));
    console.log("Overall:", overallSnapshot.size);
  } catch(e) {
    console.error("Failed:", e);
  }
  process.exit(0);
}
test();
