import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Upload,
  BarChart2,
  Printer
} from 'lucide-react';
import adminConfig from '../config/adminConfig';

export const ExcelToBarGraphReport = ({ filteredFeedbacks, selectedDept, selectedDay }) => {
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chartGridRef = useRef(null);

  const sourceRows = parsedData || filteredFeedbacks || [];
  const isOverallDay = selectedDay === "23.08.2026";
  const dictionary = isOverallDay ? adminConfig.OVERALL_QUESTIONS : adminConfig.QUESTIONS;
  const questionKeys = isOverallDay 
    ? ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14']
    : ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

  const questionsList = questionKeys.map(k => ({ code: k, title: dictionary[k] }));
  const categories = ['Poor', 'Average', 'Good', 'Very Good', 'Excellent'];

  const getRawValue = (row, qIndex, qCode) => {
    if (parsedData) {
      const colKeys = Object.keys(row);
      const matchedKey = colKeys.find(k => k.toLowerCase() === qCode.toLowerCase());
      return matchedKey ? row[matchedKey] : '';
    }

    const answers = row.answers || [];
    const isFirstAnswerFaculty = answers.length > 5 && 
      !['excellent', 'very good', 'good', 'average', 'poor', '5', '4', '3', '2', '1', '0'].includes(String(answers[0]).trim().toLowerCase());
    
    const targetIdx = (!isOverallDay && isFirstAnswerFaculty) ? qIndex + 1 : qIndex;

    if (answers[targetIdx] !== undefined) {
      return answers[targetIdx];
    }
    if (row[`Q${qIndex + 1}`] !== undefined) return row[`Q${qIndex + 1}`];
    if (row[`q${qIndex + 1}`] !== undefined) return row[`q${qIndex + 1}`];
    if (row.ratings?.[qIndex] !== undefined) return row.ratings[qIndex];
    if (row.ratings?.[`Q${qIndex + 1}`] !== undefined) return row.ratings[`Q${qIndex + 1}`];

    return '';
  };

  const chartData = questionsList.map((q, qIndex) => {
    const counts = { 'Poor': 0, 'Average': 0, 'Good': 0, 'Very Good': 0, 'Excellent': 0 };
    let totalCount = 0;

    sourceRows.forEach(row => {
      const rawVal = getRawValue(row, qIndex, q.code);

      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const strVal = String(rawVal).trim().toLowerCase();
        let matched = false;
        if (strVal === 'poor' || strVal === '0' || strVal === '1') {
          counts['Poor'] += 1; matched = true;
        } else if (strVal === 'average' || strVal === '2') {
          counts['Average'] += 1; matched = true;
        } else if (strVal === 'good' || strVal === '3') {
          counts['Good'] += 1; matched = true;
        } else if (strVal === 'very good' || strVal === '4') {
          counts['Very Good'] += 1; matched = true;
        } else if (strVal === 'excellent' || strVal === '5') {
          counts['Excellent'] += 1; matched = true;
        }

        if (matched) {
          totalCount += 1;
        }
      }
    });

    return {
      ...q,
      counts,
      totalCount,
      categories
    };
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json && json.length > 0) {
          setParsedData(json);
        } else {
          alert("Uploaded Excel file is empty or could not be parsed.");
        }
      } catch (err) {
        console.error("Error parsing Excel file:", err);
        alert("Failed to parse Excel file. Please ensure it is a valid .xlsx file.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUseDashboardData = () => {
    setParsedData(null);
    setFileName('');
  };

  const exportChartGridToPdf = async () => {
    if (!chartGridRef.current) return;
    setIsProcessing(true);
    try {
      const element = chartGridRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            const view = clonedDoc.defaultView || window;
            const comp = view.getComputedStyle(el);
            if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
            if (comp.color && comp.color.includes('oklch')) el.style.color = '#000000';
            if (comp.borderColor && comp.borderColor.includes('oklch')) el.style.borderColor = '#000000';
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      let heightLeft = imgHeight - (pdfHeight - 20);
      let position = 0;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      const titleName = fileName || `Survey_Graphs_${selectedDept || 'All'}_${selectedDay || 'All'}.pdf`;
      pdf.save(titleName.replace('.xlsx', '') + '_BarGraphs.pdf');
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF chart grid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDayLabel = (dayVal) => {
    const found = adminConfig.DAYS.find(d => d.value === dayVal);
    if (found) return found.label;
    if (dayVal === "23.08.2026") return "Day 7 (23.08.2026 - Overall Feedback Form)";
    return dayVal;
  };

  const activeTitle = fileName
    ? `Survey Responses from ${fileName}`
    : `Survey Responses from ${selectedDept || 'All Departments'} - ${selectedDay ? getDayLabel(selectedDay) : 'All Days (Aggregated Orientation)'} (${sourceRows.length} records)`;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 overflow-hidden mb-6">
      <div className="p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            <span>Excel Feedback Bar Graph Extraction (Matplotlib Style)</span>
          </h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Extracts survey feedback columns into publication-ready bar chart figures ({isOverallDay ? "14 Questions" : "5 Questions"})
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-bold py-2 px-3.5 rounded-xl shadow cursor-pointer text-xs transition">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>{fileName ? "Change Excel File" : "Extract from Excel File (.xlsx)"}</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>

          {parsedData && (
            <button onClick={handleUseDashboardData} className="px-3 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer">
              Use Dashboard Filtered Data
            </button>
          )}

          <button onClick={exportChartGridToPdf} disabled={isProcessing} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3.5 rounded-xl shadow transition cursor-pointer text-xs disabled:opacity-50">
            <Printer className="w-4 h-4" />
            <span>Export Bar Graph PDF</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-white overflow-x-auto">
        <div ref={chartGridRef} style={{ backgroundColor: '#ffffff', minWidth: '950px', padding: '24px' }} className="mx-auto space-y-8">
          
          <div className="text-center border-b pb-4 border-gray-300">
            <h1 style={{ color: '#000000', fontSize: '20px', fontWeight: 'bold' }}>
              {activeTitle}
            </h1>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <div className="grid grid-cols-3 gap-x-8 gap-y-10">
              {chartData.map((q) => {
                const maxVal = Math.max(...Object.values(q.counts), 1);
                let yAxisMax = 200;
                if (maxVal > 200) yAxisMax = Math.ceil(maxVal / 50) * 50;
                if (maxVal < 50) yAxisMax = 50;

                const yTicks = [0, yAxisMax * 0.25, yAxisMax * 0.5, yAxisMax * 0.75, yAxisMax];

                return (
                  <div key={q.code} className="flex flex-col items-center">
                    <div className="text-center h-12 flex items-center justify-center mb-2 px-2 w-full">
                      <h3 style={{ color: '#000000', fontSize: '11px', fontWeight: 'bold', lineHeight: '1.2' }} className="line-clamp-3">
                        {q.code}: {q.title}
                      </h3>
                    </div>

                    <div className="w-full flex items-stretch" style={{ height: '220px' }}>
                      <div className="flex items-center mr-1">
                        <span style={{ transform: 'rotate(-90deg)', fontSize: '11px', color: '#000000', fontWeight: '500', whiteSpace: 'nowrap' }}>Count</span>
                      </div>

                      <div className="flex flex-col justify-between items-end pr-1 text-[10px] text-black font-mono" style={{ height: '180px', marginTop: '10px' }}>
                        {yTicks.slice().reverse().map(tick => (
                          <span key={tick}>{Math.round(tick)}</span>
                        ))}
                      </div>

                      <div className="flex-1 relative flex items-end justify-around px-2 pt-6 pb-0 border-l border-b border-r border-t border-black bg-white" style={{ height: '190px' }}>
                        {yTicks.slice(1, -1).map(tick => {
                          const bottomPct = (tick / yAxisMax) * 100;
                          return (
                            <div key={tick} className="absolute left-0 right-0 border-t border-gray-100 pointer-events-none" style={{ bottom: `${bottomPct}%` }}></div>
                          );
                        })}

                        {q.categories.map(cat => {
                          const count = q.counts[cat] || 0;
                          const pct = q.totalCount > 0 ? ((count / q.totalCount) * 100).toFixed(1) : '0.0';
                          const barHeightPct = q.totalCount > 0 ? (count / yAxisMax) * 100 : 0;

                          return (
                            <div key={cat} className="flex flex-col items-center relative flex-1 max-w-[45px] h-full justify-end">
                              <div className="text-center w-full absolute pointer-events-none" style={{ bottom: `${Math.min(barHeightPct + 2, 82)}%`, color: '#000000', fontSize: '9px', lineHeight: '1.1' }}>
                                <div style={{ fontWeight: 'bold' }}>{count}</div>
                                <div style={{ fontWeight: '600' }}>({pct}%)</div>
                              </div>
                              <div className="w-[80%] transition-all duration-300 shadow-sm" style={{ height: `${count > 0 ? Math.max(barHeightPct, 2) : 0}%`, backgroundColor: '#1f77b4', borderRadius: '1px 1px 0 0' }}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full pl-8 pr-1 flex justify-around text-[9px] text-black font-semibold mt-1">
                      {q.categories.map(cat => (
                        <span key={cat} className="w-12 text-center break-words">{cat}</span>
                      ))}
                    </div>
                    
                    <div className="text-center mt-1">
                      <span style={{ fontSize: '10px', color: '#000000', fontWeight: '500' }}>Response</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExcelToBarGraphReport;
