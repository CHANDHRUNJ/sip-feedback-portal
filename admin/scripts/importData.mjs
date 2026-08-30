import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Read CSV
const csvPath = path.join(__dirname, '../../student_feedback.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');

const lines = csvData.split('\n').map(l => l.trim()).filter(l => l);
const headers = lines[0].split(',');

let imported = 0;
let duplicatesOrSkipped = 0;

async function importData() {
  console.log(`Found ${lines.length - 1} records in CSV.`);
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Better CSV regex parser
    const row = [];
    let insideQuote = false;
    let currentVal = "";
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && line[j+1] === '"') {
            currentVal += '"';
            j++;
        } else if (char === '"') {
            insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
            row.push(currentVal.trim());
            currentVal = "";
        } else {
            currentVal += char;
        }
    }
    row.push(currentVal.trim());

    if (row.length < 24) {
      duplicatesOrSkipped++;
      continue;
    }

    const document_id = row[0];
    const name = row[1];
    const department = row[2];
    const slot = row[3];
    const academic_year = row[4];
    const day = row[5];
    const session_topic = row[6];
    const session_time = row[7];
    const venue = row[8];
    const submitted_at = row[9];
    const missing_count = row[10];

    const answers = [];
    for(let q=11; q<=24; q++) {
        answers.push(row[q] || "");
    }

    const docData = {
        name,
        dept: department,
        slot,
        academicYear: academic_year,
        day,
        session: {
            topic: session_topic,
            time: session_time,
            venue
        },
        submitted_at,
        answers
    };

    try {
        await setDoc(doc(db, "overallFeedbackData", document_id), docData);
        imported++;
        if (imported % 10 == 0) console.log(`Imported ${imported}...`);
    } catch(e) {
        console.error(`Failed to import ${document_id}: `, e);
        duplicatesOrSkipped++;
    }
  }

  console.log(`Import Complete! Imported: ${imported}, Skipped/Error: ${duplicatesOrSkipped}`);
  process.exit(0);
}

importData();
