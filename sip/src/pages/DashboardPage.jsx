import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, questions } from '../api/feedbackApi';
import { StarRating } from '../components/StarRating';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import uhvFacultyBySlot from '../data/uhvFaculty.json';
import appConfig from '../config/appConfig';
const getCustomQuestions = (sessionTopic) => {
  const topic = sessionTopic?.toLowerCase() || '';

  if (topic.includes("keeladi")) {
    return [
      "How would you rate your overall learning experience during the Keeladi visit?",
      "Did the trip enhance your understanding of ancient Tamil civilization and heritage?",
      "Was the explanation at the site informative and engaging?",
      "Were the travel and logistical arrangements adequate and comfortable?",
      "Suggestions/Questions/Feedback"
    ];
  }

  if (topic.includes("feedback session")) {
    return [
      "SIP Inauguration (Chairman, Principal & Chief Guest Address): How inspiring and informative was the inauguration session?",
      "HoD Address: Did the session clarify academic regulations, teaching-learning processes, and departmental expectations?",
      "Curriculum & Placements (Dean ACAD & Dean CDC): How clear was the guidance on academic curriculum, credit system, and placement opportunities?",
      "English / Maths Proficiency Test: Was the test well-structured and effective in evaluating your foundational skills?",
      "Introductory Science & Humanities Talk Series: How helpful were the talks (Physics, Chemistry, Maths, English) in preparing you for engineering studies?",
      "Universal Human Values (UHV 1 & 2): To what extent did these sessions foster self-reflection, ethics, and human values?",
      "Placement Activities, SkillRack & Library/Campus Tour: How beneficial were the orientation on SkillRack, campus facilities, and library resources?",
      "Awareness Lecture Series: How informative were the sessions on Anti-Ragging, Anti-Drug awareness, Cybercrime, Singa Penn, and Student Helpdesk?",
      "Motivational Talk: How impactful and inspiring was the Motivational Talk in building your confidence?",
      "Clubs, NSS, NCC, YRC & Cultural Activities: How engaging was the orientation regarding student clubs and co-curricular opportunities?",
      "R&D Cell, III Cell & Alumni Association: Did the session give you clear insights into research opportunities, industry interaction, and alumni support?",
      "Physical Games & Outdoor/Indoor Sports: How enjoyable and well-organized were the physical games and sports activities?",
      "Overall SIP Coordination & Logistics: How would you rate the overall program organization, venue arrangements, sound systems, and scheduling?",
      "Please share your overall perspective on the SIP experience in a few sentences and any suggestions for future induction programs."
    ];
  }

  if (topic.includes("diagnostic test") || topic.includes("test")) {
    return [
      "Was the test content aligned with your academic level?",
      "Were the instructions for the test clear and easy to follow?",
      "Was the allotted time sufficient to complete the test?",
      "Did the test help you understand your strengths and areas to improve?",
      "Suggestions/Questions/Feedback"
    ];
  }

  return Object.values(questions).slice(0, 6);
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [dayOptions, setDayOptions] = useState([]);
  const [submittedSessions, setSubmittedSessions] = useState({});
  const [missingCount, setMissingCount] = useState(() => {
    const saved = localStorage.getItem("missingFeedbackCount") || "{}";
    return JSON.parse(saved);
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("No user data found. Redirecting...");
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Load submitted sessions for the current user
    const saved = localStorage.getItem(`submittedFeedback_${appConfig.ACADEMIC_YEAR}_${parsedUser.reg}`) || "{}";
    setSubmittedSessions(JSON.parse(saved));
  }, [navigate]);

  useEffect(() => {
    if (user?.dept) {
      const options = api.getAvailableDays(user.dept);
      setDayOptions(options);
    }
  }, [user?.dept]);

  useEffect(() => {
    if (user?.dept && user?.day) {
      const userSessions = api.getSessionData(user.dept, user.day);
      setSessions(userSessions);
    }
  }, [user?.dept, user?.day]);

  // Update and store missing feedback count whenever sessions or submissions change
  useEffect(() => {
    if (user?.dept && user?.day && sessions.length > 0) {
      const count = sessions.filter(
        session => !submittedSessions[`${user.dept}-${user.day}-${session.topic}`]
      ).length;

      setMissingCount(prev => {
        const updated = { ...prev, [`${user.day}`]: count };
        localStorage.setItem("missingFeedbackCount", JSON.stringify(updated));
        return updated;
      });
    }
  }, [sessions, submittedSessions, user]);

  const handleDayChange = (e) => {
    const newDay = e.target.value;
    setFeedback({});
    setUser(currentUser => {
      const updatedUser = { ...currentUser, day: newDay };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleLogout = () => {
    api.studentLogout();
    navigate('/');
  };

  const handleFeedbackChange = (key, value) => {
    setFeedback(prev => ({ ...prev, [key]: value }));
  };

  const submitFeedback = async (sessionIndex, session) => {
    const sessionKey = `${user.dept}-${user.day}-${session.topic}`;

    if (submittedSessions[sessionKey]) {
      toast.info("You have already submitted feedback for this session.");
      return;
    }

    const customQuestions = getCustomQuestions(session.topic);
    const ratingTexts = ["Poor", "Average", "Good", "Very Good", "Excellent"];
    const answers = [];
    const ratings = {};

    for (let qIndex = 0; qIndex < customQuestions.length; qIndex++) {
      const isUHV = session.topic.toLowerCase().includes("universal human values");
      const isFacultyDropdown = isUHV && qIndex === 0;
      const isSuggestion = qIndex === customQuestions.length - 1;
      const key = `${sessionKey}-${qIndex}`;
      const ratingVal = feedback[key];

      if (isFacultyDropdown) {
        answers.push(ratingVal || 'Not Selected');
      } else if (isSuggestion) {
        answers.push(ratingVal || '');
      }
      else {
        const label = ratingTexts[(ratingVal || 0) - 1] || 'Not Rated';
        answers.push(label);
      }

      if (ratingVal !== undefined) {
        ratings[qIndex] = ratingVal;
      }
    }

    const feedbackData = {
      academicYear: appConfig.ACADEMIC_YEAR,
      name: user.name,
      dept: user.dept,
      day: user.day,
      slot: user.slot || "",
      session,
      answers,
      missingCount: missingCount[user.day] ?? 0 // send exact missing count
    };


    const result = await api.submitFeedback(feedbackData);

    if (result.status === "success") {
      toast.success("Feedback submitted successfully!");
      const submissionEntry = {
        submitted: true,
        answers,
        ratings
      };
      const updated = { ...submittedSessions, [sessionKey]: submissionEntry };
      setSubmittedSessions(updated);
      localStorage.setItem(`submittedFeedback_${appConfig.ACADEMIC_YEAR}_${user.reg}`, JSON.stringify(updated));

      // 🔹 Recalculate missing count immediately
      const remaining = sessions.filter(
        s => !updated[`${user.dept}-${user.day}-${s.topic}`]
      ).length;
      const updatedMissing = { ...missingCount, [user.day]: remaining };
      setMissingCount(updatedMissing);
      localStorage.setItem("missingFeedbackCount", JSON.stringify(updatedMissing));
    } else {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen items-center p-4 sm:p-8">
      <ToastContainer />
      <div className="flex justify-center mb-6">
        <img
          src="/images/college_logo.png"
          alt="College Logo"
          className="w-24 h-auto rounded-lg shadow-lg"
        />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
        {appConfig.PROGRAM_NAME} - {appConfig.PORTAL_TITLE}
      </h1>

      {/* 🔹 Visual Progress Tracker */}
      {sessions.length > 0 && (() => {
        const total = sessions.length;
        const completed = sessions.filter(
          s => Boolean(submittedSessions[`${user.dept}-${user.day}-${s.topic}`])
        ).length;
        const percentage = Math.round((completed / total) * 100);

        return (
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
              <span className="font-bold text-gray-800 text-base sm:text-lg">
                {user.day}: Progress Tracker
              </span>
              <span className="text-sm font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                {completed} of {total} sessions completed ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mt-2">
              <div
                className={`h-4 transition-all duration-500 rounded-full ${
                  percentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            {percentage === 100 ? (
              <p className="text-xs text-green-700 font-semibold mt-2 text-right">
                🎉 All feedbacks for {user.day} completed!
              </p>
            ) : (
              <p className="text-xs text-amber-700 font-medium mt-2 text-right">
                {total - completed} feedback{total - completed > 1 ? 's' : ''} pending for {user.day}
              </p>
            )}
          </div>
        );
      })()}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Welcome {user.name} ({user.dept})
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="day-select" className="font-semibold">Viewing Day:</label>
              <select
                value={user.day}
                onChange={handleDayChange}
                className="p-2 border rounded"
              >
                {dayOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div>
          {sessions.length > 0 ? sessions.map((session, index) => {
            const customQuestions = getCustomQuestions(session.topic);
            const sessionKey = `${user.dept}-${user.day}-${session.topic}`;
            const sessionSubmission = submittedSessions[sessionKey];
            const isSubmitted = Boolean(sessionSubmission);

            return (
              <div key={`${user.day}-${index}`} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
                {isSubmitted && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold text-sm flex items-center justify-between">
                    <span>✓ Feedback Submitted for this session</span>
                    <span className="text-xs bg-green-200 text-green-900 px-2.5 py-1 rounded-full font-bold">Submitted</span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {session.topic} ({session.time})
                  {session.topic.toLowerCase().includes("universal human values") && user.slot && (
                    <span className="block text-sm text-gray-600 mt-1">
                      Faculty Incharge: {uhvFacultyBySlot[user.slot?.toUpperCase().trim()]?.join(' / ') || "Not Assigned"}
                    </span>
                  )}
                </h3>


{customQuestions.map((question, qIndex) => {
  const isSuggestion = qIndex === customQuestions.length - 1;
  const isUHV = session.topic.toLowerCase().includes("universal human values");
  const isFacultyDropdown = isUHV && qIndex === 0;
  const key = `${sessionKey}-${qIndex}`;

  const savedRating = (typeof sessionSubmission === 'object' && sessionSubmission?.ratings) ? sessionSubmission.ratings[qIndex] : null;
  const currentRating = feedback[key] !== undefined ? feedback[key] : (savedRating || 0);

  const savedText = (typeof sessionSubmission === 'object' && sessionSubmission?.answers) ? sessionSubmission.answers[qIndex] : null;
  const currentText = feedback[key] !== undefined ? feedback[key] : (savedText || '');

  return (
    <div key={key} className="mb-4">
      <label className="block font-semibold text-gray-700 mb-2">
        {qIndex + 1}. {question}
      </label>

      {isFacultyDropdown ? (
        <select
          className="w-full p-2 border rounded-md disabled:bg-gray-100 disabled:text-gray-600"
          value={currentText}
          onChange={e => handleFeedbackChange(key, e.target.value)}
          disabled={isSubmitted}
        >
          <option value="">Select Faculty</option>
          {uhvFacultyBySlot[user.slot?.toUpperCase().trim()] && 
            uhvFacultyBySlot[user.slot?.toUpperCase().trim()].map((facultyName, idx) => (
              <option key={idx} value={facultyName}>
                {facultyName}
              </option>
            ))
          }
        </select>
      ) : isSuggestion ? (
        <textarea
          className="w-full p-3 border rounded-md disabled:bg-gray-100 disabled:text-gray-600"
          placeholder="Your suggestions or feedback"
          value={currentText}
          onChange={e => handleFeedbackChange(key, e.target.value)}
          disabled={isSubmitted}
        />
      ) : (
        <StarRating
          rating={currentRating}
          setRating={rating => handleFeedbackChange(key, rating)}
          disabled={isSubmitted}
        />
      )}
    </div>
  );
})}


               
                <button
                  id={`submit-btn-${index}`}
                  onClick={() => submitFeedback(index, session)}
                  className="w-full cursor-pointer sm:w-auto bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? "Submitted" : "Submit Feedback"}
                </button>
              </div>
            );
          }) : (
            <p className="text-center text-gray-600 font-medium">
              No sessions scheduled for your department on {user.day}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

