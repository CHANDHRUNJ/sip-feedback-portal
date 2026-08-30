import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

// Read firebase config from adminConfig if possible, or just paste it
// Wait, I can just read admin/src/config/firebase.js
import { firebaseConfig } from "../src/config/firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const feedbackSnap = await getDocs(collection(db, "feedback"));
    console.log("feedback collection count:", feedbackSnap.size);

    const overallSnap = await getDocs(collection(db, "overallFeedbackData"));
    console.log("overallFeedbackData collection count:", overallSnap.size);
    
    // Check one document from overall
    if (overallSnap.size > 0) {
      console.log("Sample overall doc:", overallSnap.docs[0].data());
    }
  } catch (err) {
    console.error(err);
  }
}

check();
