import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Printer
} from 'lucide-react';
import adminConfig from '../config/adminConfig';

export const SurveyAnalytics = ({ filteredFeedbacks, selectedDept, selectedDay }) => {
  const reportRef = useRef(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const ratingCategories = ['Excellent', 'Very Good', 'Good', 'Average', 'Poor'];

  const isOverallDay = selectedDay === "23.08.2026";
  const questionKeys = isOverallDay
    ? ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14']
    : ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

  const dictionary = isOverallDay ? adminConfig.OVERALL_QUESTIONS : adminConfig.QUESTIONS;

  // Helper to extract rating value for a specific question index from a feedback item
  const getRatingValue = (item, qIndex) => {
    let raw = undefined;
    const answers = item.answers || [];

    // Check if answers[0] is a non-rating string (e.g. faculty name for UHV sessions)
    const isFirstAnswerFaculty = answers.length > 5 && 
      !['excellent', 'very good', 'good', 'average', 'poor', '5', '4', '3', '2', '1', '0'].includes(String(answers[0]).trim().toLowerCase());
    
    const targetIdx = (!isOverallDay && isFirstAnswerFaculty) ? qIndex + 1 : qIndex;

    if (answers[targetIdx] !== undefined) {
      raw = answers[targetIdx];
    } else if (item[`Q${qIndex + 1}`] !== undefined) {
      raw = item[`Q${qIndex + 1}`];
    } else if (item[`q${qIndex + 1}`] !== undefined) {
      raw = item[`q${qIndex + 1}`];
    } else if (item.ratings?.[qIndex] !== undefined) {
      raw = item.ratings[qIndex];
    } else if (item.ratings?.[`Q${qIndex + 1}`] !== undefined) {
      raw = item.ratings[`Q${qIndex + 1}`];
    }

    return raw;
  };

  // Aggregate questions across the filteredFeedbacks
  const analyticsData = questionKeys.map((qKey, qIndex) => {
    const counts = { 'Excellent': 0, 'Very Good': 0, 'Good': 0, 'Average': 0, 'Poor': 0 };
    let totalRated = 0;

    filteredFeedbacks.forEach(item => {
      const val = getRatingValue(item, qIndex);
      if (val !== undefined && val !== null && val !== '') {
        const strVal = String(val).trim().toLowerCase();
        let matched = false;
        
        if (strVal === '5' || strVal === '4' || strVal === 'excellent') {
          counts['Excellent'] += 1; matched = true;
        } else if (strVal === '3' || strVal === 'very good') {
          counts['Very Good'] += 1; matched = true;
        } else if (strVal === '2' || strVal === 'good') {
          counts['Good'] += 1; matched = true;
        } else if (strVal === '1' || strVal === 'average') {
          counts['Average'] += 1; matched = true;
        } else if (strVal === '0' || strVal === 'poor') {
          counts['Poor'] += 1; matched = true;
        }
        
        if (matched) {
          totalRated += 1;
        }
      }
    });

    const questionTitle = dictionary[qKey] || `Question ${qIndex + 1}`;

    return {
      qKey,
      qIndex,
      title: questionTitle,
      counts,
      totalRated
    };
  });

  const handleExportPdf = async () => {
    setGeneratingPdf(true);
    try {
      const element = reportRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            const comp = clonedDoc.defaultView.getComputedStyle(el);
            if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            if (comp.color && comp.color.includes('oklch')) {
              el.style.color = '#111827';
            }
            if (comp.borderColor && comp.borderColor.includes('oklch')) {
              el.style.borderColor = '#e5e7eb';
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `SIP_Survey_BarGraph_Report_${selectedDept || 'AllDepts'}_${selectedDay || 'AllDays'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate PDF report. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const colors = {
    'Excellent': { hex: '#10b981', textHex: '#047857', bgHex: '#ecfdf5' },
    'Very Good': { hex: '#3b82f6', textHex: '#1d4ed8', bgHex: '#eff6ff' },
    'Good': { hex: '#eab308', textHex: '#a16207', bgHex: '#fefce8' },
    'Average': { hex: '#f97316', textHex: '#c2410c', bgHex: '#fff7ed' },
    'Poor': { hex: '#ef4444', textHex: '#b91c1c', bgHex: '#fef2f2' }
  };

  const getDayLabel = (dayVal) => {
    const found = adminConfig.DAYS.find(d => d.value === dayVal);
    if (found) return found.label;
    if (dayVal === "23.08.2026") return "Day 7 (23.08.2026 - Overall Feedback Form)";
    return dayVal;
  };

  const sectionTitle = selectedDay 
    ? (isOverallDay ? "Day 7 (23.08.2026) — Overall Feedback Form (14 Questions)" : `${getDayLabel(selectedDay)} — Orientation Session Feedback (5 Questions)`)
    : "All Days — Aggregated Orientation Feedback (5 Questions)";

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 overflow-hidden mb-6">
      <div className="p-5 border-b bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            <span>Survey Analytics & Bar Graphs</span>
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            {isOverallDay ? "14-Question Overall Feedback Graphs" : "5-Question Orientation Feedback Graphs"}
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={generatingPdf}
          className="flex items-center gap-2 bg-white text-amber-900 hover:bg-amber-50 font-bold py-2.5 px-4 rounded-xl shadow-lg transition cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {generatingPdf ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4 text-amber-800" />
              <span>Export PDF with Bar Graphs</span>
            </>
          )}
        </button>
      </div>

      <div ref={reportRef} style={{ backgroundColor: '#ffffff', color: '#1f2937' }} className="p-6 space-y-6">

        <div style={{ borderColor: '#f59e0b' }} className="border-b-2 pb-4 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3">
              <img src="/images/college_logo.png" alt="Logo" className="w-12 h-auto" />
              <div>
                <h1 style={{ color: '#111827' }} className="text-xl font-black tracking-tight">
                  {adminConfig.COLLEGE_NAME}
                </h1>
                <h2 style={{ color: '#b45309' }} className="text-sm font-bold">
                  {adminConfig.PROGRAM_NAME} • Survey Analytics Report
                </h2>
              </div>
            </div>
          </div>

          <div style={{ color: '#4b5563' }} className="text-right text-xs">
            <div><span style={{ color: '#1f2937' }} className="font-bold">Department:</span> {selectedDept || 'All Departments'}</div>
            <div><span style={{ color: '#1f2937' }} className="font-bold">Viewing Filter:</span> {selectedDay ? getDayLabel(selectedDay) : 'All Days (Aggregated Orientation)'}</div>
            <div><span style={{ color: '#1f2937' }} className="font-bold">Matching Responses:</span> <span style={{ color: '#92400e' }} className="font-extrabold">{filteredFeedbacks.length}</span></div>
            <div><span style={{ color: '#1f2937' }} className="font-bold">Generated On:</span> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mb-4 bg-gray-100 p-3 rounded-lg border-l-4 border-yellow-500 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            {sectionTitle}
          </h3>
          <span className="text-xs sm:text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded border shadow-sm">
            {filteredFeedbacks.length} Responses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analyticsData.map(q => {
            const maxCount = Math.max(...Object.values(q.counts), 1);

            return (
              <div
                key={q.qKey}
                style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                className="p-4 rounded-xl border shadow-sm space-y-3"
              >
                <div style={{ borderColor: '#e5e7eb' }} className="flex items-center justify-between border-b pb-2">
                  <span
                    style={{ backgroundColor: '#fef3c7', color: '#78350f' }}
                    className="font-black text-xs px-2 py-0.5 rounded shrink-0"
                  >
                    {q.qKey}
                  </span>
                  <h3 style={{ color: '#1f2937' }} className="font-bold text-xs flex-1 ml-2 line-clamp-2" title={q.title}>
                    {q.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  {ratingCategories.map(cat => {
                    const count = q.counts[cat] || 0;
                    const pct = q.totalRated > 0 ? Math.round((count / q.totalRated) * 100) : 0;
                    const barWidthPct = q.totalRated > 0 ? Math.round((count / maxCount) * 100) : 0;
                    const colorScheme = colors[cat];

                    return (
                      <div key={cat} className="space-y-0.5">
                        <div style={{ color: '#4b5563' }} className="flex justify-between items-center text-[11px] font-medium">
                          <span>{cat}</span>
                          <span style={{ color: '#111827' }} className="font-bold">{count} ({pct}%)</span>
                        </div>
                        <div style={{ backgroundColor: '#e5e7eb' }} className="w-full rounded-full h-3.5 overflow-hidden flex items-center">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${count > 0 ? Math.max(barWidthPct, 5) : 0}%`,
                              backgroundColor: colorScheme.hex
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SurveyAnalytics;
