import sessionDataFull from '../data/sessionData.js';
import sessionDataSelected from '../data/sessionData_selected_with_motivational.js';

import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const questions = {
  Q1: "Opinion about overall session",
  Q2: "Clarity in the speech",
  Q3: "Speaker's interaction with the students",
  Q4: "Was the session informative and clear?",
  Q5: "Did the session meet your expectations?",
  Q6: "Suggestions/Questions/Feedback"
};

/**
 * Helper to get sorted dates for a department.
 * Uses sessionData_selected_with_motivational for daily sessions
 * and includes 23.08.2026 for the overall feedback form.
 * @param {string} dept - The department name.
 * @returns {Array<string>} A sorted array of date strings.
 */
const getSortedDatesForDept = (dept) => {
  const datesSet = new Set();
  
  if (sessionDataSelected[dept]) {
    Object.keys(sessionDataSelected[dept]).forEach(date => datesSet.add(date));
  }
  
  // Always include 23.08.2026 as the overall form day
  datesSet.add("23.08.2026");

  const dates = Array.from(datesSet);
  dates.sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('.').map(Number);
    const [dayB, monthB, yearB] = b.split('.').map(Number);
    return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
  });
  return dates;
};

export const api = {
  /**
   * Fetches all feedback from Firestore "feedback" collection.
   * @returns {Promise<Array>} A promise that resolves to an array of feedback objects.
   */
  getFeedback: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "feedback"));
      const feedbacks = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        feedbacks.push({
          _id: doc.id,
          ...data,
          submitted_at: data.submitted_at?.toDate ? data.submitted_at.toDate() : data.submitted_at
        });
      });
      return feedbacks;
    } catch (error) {
      console.error("Failed to fetch feedback from Firestore:", error);
      return [];
    }
  },

  /**
   * Submits a new feedback entry to Firestore "feedback" collection.
   * @param {object} feedback - The feedback object to submit.
   * @returns {Promise<object>} A promise that resolves to the response object with status.
   */
  submitFeedback: async (feedback) => {
    try {
      const timestamp = serverTimestamp();
      
      const docRef = await addDoc(collection(db, "feedback"), {
        ...feedback,
        submitted_at: timestamp
      });

      // Write to overallFeedbackData if this is an overall feedback submission (14 questions)
      if (feedback.answers && feedback.answers.length === 14) {
        import('firebase/firestore').then(({ setDoc, doc }) => {
           setDoc(doc(db, "overallFeedbackData", docRef.id), {
             ...feedback,
             submitted_at: timestamp
           }).catch(err => console.error("Failed to mirror to overallFeedbackData:", err));
        });
      }

      return { status: 'success', message: 'Feedback saved.', inserted_id: docRef.id };
    } catch (error) {
      console.error("Failed to submit feedback to Firestore:", error);
      return { status: 'error', message: error.toString() };
    }
  },

  // Admin and user login/logout logic
  login: (password) => {
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('isAdmin');
  },

  studentLogout: () => {
    localStorage.removeItem('user');
  },

  isAdmin: () => {
    return localStorage.getItem('isAdmin') === 'true';
  },

  /**
   * Gets session data for a specific department and day.
   * Day 23.08.2026 uses sessionData.js (Overall Feedback Form).
   * Remaining days use sessionData_selected_with_motivational.js.
   * @param {string} dept - The department name.
   * @param {string} day - The day in "Day X" format or date string.
   * @returns {Array} An array of session objects for that day.
   */
  getSessionData: (dept, day) => {
    if (!dept || !day) return [];

    const sortedDates = getSortedDatesForDept(dept);
    
    let targetDate = null;
    if (typeof day === 'string' && day.startsWith("Day ")) {
      const dayIndex = parseInt(day.split(' ')[1], 10) - 1;
      if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex < sortedDates.length) {
        targetDate = sortedDates[dayIndex];
      }
    } else {
      targetDate = day;
    }

    if (!targetDate) return [];

    // Overall form on 23.08.2026 comes from sessionData.js
    if (targetDate === "23.08.2026") {
      return sessionDataFull[dept]?.["23.08.2026"] || [
        {
          time: "09:00 AM to 04:00 PM",
          topic: "Feedback Session with HoD and faculties",
          venue: "Department Class room"
        }
      ];
    }

    // Remaining days come from sessionData_selected_with_motivational.js
    return sessionDataSelected[dept]?.[targetDate] || [];
  },

  /**
   * Gets the available days for a department to populate a dropdown.
   * @param {string} dept - The department name.
   * @returns {Array<object>} An array of objects with value and label for dropdown options.
   */
  getAvailableDays: (dept) => {
    const sortedDates = getSortedDatesForDept(dept);
    return sortedDates.map((date, index) => {
      const isOverall = date === "23.08.2026";
      const labelText = isOverall
        ? `Day ${index + 1} (${date} - Overall Feedback Form)`
        : `Day ${index + 1} (${date})`;
      return {
        value: `Day ${index + 1}`,
        label: labelText,
        date: date
      };
    });
  }
};
