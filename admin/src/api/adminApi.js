import { adminConfig, mapDayToDate, normalizeDate } from '../config/adminConfig';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const adminApi = {
  login: (password) => {
    if (password === adminConfig.ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    sessionStorage.removeItem('isAdmin');
    localStorage.removeItem('isAdmin');
  },

  isAdmin: () => {
    return sessionStorage.getItem('isAdmin') === 'true' || localStorage.getItem('isAdmin') === 'true';
  },

  getFeedback: async () => {
    const rawFeedbacks = [];

    // 1. Fetch from standard feedback collection (Days 1 - 6 orientation responses)
    try {
      const regularSnapshot = await getDocs(collection(db, "feedback"));
      regularSnapshot.forEach((doc) => {
        const data = doc.data();
        
        let answers = data.answers || [];
        if (!data.answers && (data.Q1 !== undefined || data.Q5 !== undefined || data.Q14 !== undefined)) {
          answers = [
            data.Q1 ?? '', data.Q2 ?? '', data.Q3 ?? '', data.Q4 ?? '', data.Q5 ?? '',
            data.Q6 ?? '', data.Q7 ?? '', data.Q8 ?? '', data.Q9 ?? '', data.Q10 ?? '',
            data.Q11 ?? '', data.Q12 ?? '', data.Q13 ?? '', data.Q14 ?? ''
          ].filter(x => x !== '');
        }

        const submittedAtStr = data.submitted_at?.toDate ? data.submitted_at.toDate().toISOString() : (data.submitted_at || null);
        const mappedDay = mapDayToDate(data.dept, data.day, submittedAtStr);
        const normalizedDay = normalizeDate(mappedDay || data.day);

        rawFeedbacks.push({
          _id: doc.id,
          ...data,
          answers,
          day: normalizedDay,
          raw_day: data.day,
          source_collection: 'feedback',
          submitted_at: submittedAtStr
        });
      });
    } catch (error) {
      console.warn("Notice: Fetching 'feedback' collection:", error);
    }

    // 2. Fetch from overallFeedbackData collection (Day 7 overall feedback responses)
    try {
      const overallSnapshot = await getDocs(collection(db, "overallFeedbackData"));
      overallSnapshot.forEach((doc) => {
        const data = doc.data();
        
        let answers = data.answers || [];
        if (!data.answers && (data.Q1 !== undefined || data.Q14 !== undefined)) {
          answers = [
            data.Q1 ?? '', data.Q2 ?? '', data.Q3 ?? '', data.Q4 ?? '', data.Q5 ?? '',
            data.Q6 ?? '', data.Q7 ?? '', data.Q8 ?? '', data.Q9 ?? '', data.Q10 ?? '',
            data.Q11 ?? '', data.Q12 ?? '', data.Q13 ?? '', data.Q14 ?? ''
          ];
        }

        const submittedAtStr = data.submitted_at?.toDate ? data.submitted_at.toDate().toISOString() : (data.submitted_at || null);

        rawFeedbacks.push({
          _id: doc.id,
          ...data,
          answers,
          day: "23.08.2026",
          raw_day: data.day || "Day 7",
          source_collection: 'overallFeedbackData',
          submitted_at: submittedAtStr
        });
      });
    } catch (error) {
      console.error("Failed to fetch overallFeedbackData:", error);
    }

    // 3. Deduplicate strictly by Firestore Document ID to preserve all unique student entries
    const seenIds = new Set();
    const uniqueFeedbacks = [];

    rawFeedbacks.forEach(item => {
      if (item._id && seenIds.has(item._id)) {
        return;
      }
      if (item._id) seenIds.add(item._id);
      uniqueFeedbacks.push(item);
    });

    return uniqueFeedbacks;
  }
};

export default adminApi;
