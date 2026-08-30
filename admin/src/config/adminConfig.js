export const sessionSchedule = {
  "AI-ML": ["18.08.2026", "19.08.2026", "21.08.2026", "23.08.2026"],
  "MECHATRONICS": ["19.08.2026", "20.08.2026", "21.08.2026", "23.08.2026"],
  "VLSI": ["19.08.2026", "21.08.2026", "23.08.2026"],
  "EC": ["19.08.2026", "21.08.2026", "23.08.2026"],
  "EEE": ["19.08.2026", "20.08.2026", "21.08.2026", "23.08.2026"],
  "CIVIL": ["19.08.2026", "20.08.2026", "21.08.2026", "23.08.2026"],
  "CSBS": ["18.08.2026", "21.08.2026", "23.08.2026"],
  "IT": ["18.08.2026", "19.08.2026", "21.08.2026", "23.08.2026"],
  "CSE": ["18.08.2026", "20.08.2026", "21.08.2026", "23.08.2026"],
  "MECH": ["19.08.2026", "21.08.2026", "23.08.2026"],
  "ECE": ["19.08.2026", "21.08.2026", "23.08.2026"],
  "FASHION": ["21.08.2026", "23.08.2026"],
  "AMCS": ["19.08.2026", "21.08.2026", "23.08.2026"]
};

export const adminConfig = {
  ADMIN_PASSWORD: "jeevs@7",
  COLLEGE_NAME: "Thiagarajar College of Engineering",
  PROGRAM_NAME: "First Year Student Induction Programme 2026",
  PORTAL_TITLE: "SIP Admin Panel",

  QUESTIONS: {
    Q1: "Opinion about overall session",
    Q2: "Clarity in the speech",
    Q3: "Speaker's interaction with the students",
    Q4: "Was the session informative and clear?",
    Q5: "Did the session meet your expectations?",
    Q6: "Suggestions/Questions/Feedback"
  },
  
  OVERALL_QUESTIONS: {
    Q1: "SIP Inauguration (Chairman, Principal & Chief Guest Address): How inspiring and informative was the inauguration session?",
    Q2: "HoD Address: Did the session clarify academic regulations, teaching-learning processes, and departmental expectations?",
    Q3: "Curriculum & Placements (Dean ACAD & Dean CDC): How clear was the guidance on academic curriculum, credit system, and placement opportunities?",
    Q4: "English / Maths Proficiency Test: Was the test well-structured and effective in evaluating your foundational skills?",
    Q5: "Introductory Science & Humanities Talk Series: How helpful were the talks (Physics, Chemistry, Maths, English) in preparing you for engineering studies?",
    Q6: "Universal Human Values (UHV 1 & 2): To what extent did these sessions foster self-reflection, ethics, and human values?",
    Q7: "Placement Activities, SkillRack & Library/Campus Tour: How beneficial were the orientation on SkillRack, campus facilities, and library resources?",
    Q8: "Awareness Lecture Series: How informative were the sessions on Anti-Ragging, Anti-Drug awareness, Cybercrime, Singa Penn, and Student Helpdesk?",
    Q9: "Motivational Talk: How impactful and inspiring was the Motivational Talk in building your confidence?",
    Q10: "Clubs, NSS, NCC, YRC & Cultural Activities: How engaging was the orientation regarding student clubs and co-curricular opportunities?",
    Q11: "R&D Cell, III Cell & Alumni Association: Did the session give you clear insights into research opportunities, industry interaction, and alumni support?",
    Q12: "Physical Games & Outdoor/Indoor Sports: How enjoyable and well-organized were the physical games and sports activities?",
    Q13: "Overall SIP Coordination & Logistics: How would you rate the overall program organization, venue arrangements, sound systems, and scheduling?",
    Q14: "Please share your overall perspective on the SIP experience in a few sentences and any suggestions for future induction programs."
  },

  DEPARTMENTS: [
    "AI-ML",
    "MECHATRONICS",
    "VLSI",
    "EC",
    "EEE",
    "CIVIL",
    "CSBS",
    "IT",
    "CSE",
    "MECH",
    "ECE",
    "FASHION",
    "AMCS"
  ],

  // Programme days with exact calendar dates
  DAYS: [
    { value: "17.08.2026", label: "Day 1 (17.08.2026)", dayNumber: 1, formType: "orientation" },
    { value: "18.08.2026", label: "Day 2 (18.08.2026)", dayNumber: 2, formType: "orientation" },
    { value: "19.08.2026", label: "Day 3 (19.08.2026)", dayNumber: 3, formType: "orientation" },
    { value: "20.08.2026", label: "Day 4 (20.08.2026)", dayNumber: 4, formType: "orientation" },
    { value: "21.08.2026", label: "Day 5 (21.08.2026)", dayNumber: 5, formType: "orientation" },
    { value: "22.08.2026", label: "Day 6 (22.08.2026)", dayNumber: 6, formType: "orientation" },
    { value: "23.08.2026", label: "Day 7 (23.08.2026 - Overall Feedback Form)", dayNumber: 7, formType: "overall" }
  ]
};

export const normalizeDate = (rawDate) => {
  if (!rawDate) return "";
  if (typeof rawDate !== "string") {
    if (rawDate instanceof Date) {
      const d = String(rawDate.getDate()).padStart(2, '0');
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const y = rawDate.getFullYear();
      return `${d}.${m}.${y}`;
    }
    return String(rawDate);
  }
  const str = rawDate.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split('-');
    return `${d}.${m}.${y}`;
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  }
  return str;
};

export const mapDayToDate = (dept, dayStr, submittedAt = null) => {
  let str = "";
  if (dayStr) {
    str = String(dayStr).trim();
  }

  if (str) {
    // 1. If already explicit date string
    if (str.includes("17.08.2026") || str.includes("2026-08-17")) return "17.08.2026";
    if (str.includes("18.08.2026") || str.includes("2026-08-18")) return "18.08.2026";
    if (str.includes("19.08.2026") || str.includes("2026-08-19")) return "19.08.2026";
    if (str.includes("20.08.2026") || str.includes("2026-08-20")) return "20.08.2026";
    if (str.includes("21.08.2026") || str.includes("2026-08-21")) return "21.08.2026";
    if (str.includes("22.08.2026") || str.includes("2026-08-22")) return "22.08.2026";
    if (str.includes("23.08.2026") || str.includes("2026-08-23")) return "23.08.2026";

    // 2. Resolve relative "Day X" from student department schedule
    const dUpper = (dept || "").toUpperCase().trim();
    const deptDates = sessionSchedule[dUpper];

    const lower = str.toLowerCase();
    let dayNum = 0;
    if (lower.includes("day 1") || lower === "day1" || lower === "1") dayNum = 1;
    else if (lower.includes("day 2") || lower === "day2" || lower === "2") dayNum = 2;
    else if (lower.includes("day 3") || lower === "day3" || lower === "3") dayNum = 3;
    else if (lower.includes("day 4") || lower === "day4" || lower === "4") dayNum = 4;
    else if (lower.includes("day 5") || lower === "day5" || lower === "5") dayNum = 5;
    else if (lower.includes("day 6") || lower === "day6" || lower === "6") dayNum = 6;
    else if (lower.includes("day 7") || lower === "day7" || lower === "7") dayNum = 7;

    if (dayNum > 0 && deptDates && dayNum <= deptDates.length) {
      return deptDates[dayNum - 1];
    }

    // Fallback to absolute programme schedule
    const fallback = ["17.08.2026", "18.08.2026", "19.08.2026", "20.08.2026", "21.08.2026", "22.08.2026", "23.08.2026"];
    if (dayNum >= 1 && dayNum <= 7) {
      return fallback[dayNum - 1];
    }
  }

  // 3. Fallback: If timestamp submitted_at provides a valid date within programme range (17-23 Aug 2026)
  if (submittedAt) {
    const norm = normalizeDate(submittedAt);
    if (norm && norm.includes(".08.2026")) {
      return norm;
    }
  }

  return str || "17.08.2026";
};

export default adminConfig;
