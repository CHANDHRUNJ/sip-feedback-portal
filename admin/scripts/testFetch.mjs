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
  const querySnapshot = await getDocs(collection(db, 'overallFeedbackData'));
  let i = 0;
  querySnapshot.forEach(doc => {
    if (i === 0) {
      console.dir(doc.data(), { depth: null });
    }
    i++;
  });
  console.log(`Total docs: ${i}`);
  process.exit(0);
}
test();
