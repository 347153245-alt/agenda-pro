import React, { useState, useEffect, useRef } from 'react';
import { AgendaItemType, AgendaItem } from './types';
import { MEETING_DETAILS, AGENDA_ITEMS, OFFICERS, WEEKDAYS, MONTHS } from './constants';

// --- Helpers ---

const AutoResizeTextarea = ({ value, onChange, className, ...props }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`resize-none overflow-hidden bg-transparent outline-none focus:border-b focus:border-tm-blue ${className}`}
      rows={1}
      {...props}
    />
  );
};

const addMinutes = (timeStr: string, minutesStr: string): string => {
  if (!timeStr) return "";
  
  const [hours, mins] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(mins)) return timeStr;

  // Extract number from string (e.g., "15m" -> 15, "7" -> 7)
  const durationMatch = minutesStr.match(/([\d.]+)/);
  const duration = durationMatch ? parseFloat(durationMatch[0]) : 0;

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins + duration);

  const newHours = String(date.getHours()).padStart(2, '0');
  const newMins = String(date.getMinutes()).padStart(2, '0');
  return `${newHours}:${newMins}`;
};

export default function App() {
  // --- State ---
  const [details, setDetails] = useState(MEETING_DETAILS);
  const [agendaItems, setAgendaItems] = useState(AGENDA_ITEMS);
  const [officers, setOfficers] = useState(OFFICERS);
  
  // UI State
  const [selectedWeekday, setSelectedWeekday] = useState("Sunday");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedDay, setSelectedDay] = useState("4"); // String for free input
  const [zoomLevel, setZoomLevel] = useState(1);

  // --- Logic: Time Calculation ---
  useEffect(() => {
    // We calculate times entirely based on the first slot + cumulative durations
    let currentTime = details.time;
    
    const calculatedItems = agendaItems.map((item, index) => {
      // Capture the calculated start time for the current item
      const thisItemTime = currentTime;

      // Update the running time for the NEXT item by adding current item's duration
      // We do this for ALL items, including the first one, so the second item gets the correct start time.
      if (item.duration) {
         currentTime = addMinutes(currentTime, item.duration);
      }
      
      // First item's time is always locked to the meeting start time (controlled by user)
      if (index === 0) {
        return { ...item, time: details.time };
      }
      
      // If it's a section header, we usually don't display the time (visual preference)
      if (item.type === AgendaItemType.SECTION_HEADER) {
        return { ...item, time: "" }; 
      }

      // For all other items, use the calculated time
      return { ...item, time: thisItemTime };
    });

    // Deep compare to avoid infinite render loops
    const hasChanges = JSON.stringify(calculatedItems) !== JSON.stringify(agendaItems);
    if (hasChanges) {
      setAgendaItems(calculatedItems);
    }
  }, [details.time, JSON.stringify(agendaItems.map(i => ({t: i.type, d: i.duration})) )]); // Recalc when durations or types change

  // --- Handlers: CRUD ---

  const handleDetailChange = (key: keyof typeof details, value: any) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleOfficerChange = (index: number, name: string) => {
    const newOfficers = [...officers];
    newOfficers[index].name = name;
    setOfficers(newOfficers);
  };

  const handleAgendaChange = (index: number, field: keyof AgendaItem, value: any) => {
    const newItems = [...agendaItems];
    newItems[index] = { ...newItems[index], [field]: value };
    // Trigger useEffect
    setAgendaItems(newItems);
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === agendaItems.length - 1) return;
    
    const newItems = [...agendaItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setAgendaItems(newItems);
  };

  const deleteRow = (index: number) => {
    if (confirm("Are you sure you want to delete this row?")) {
      const newItems = agendaItems.filter((_, i) => i !== index);
      setAgendaItems(newItems);
    }
  };

  const addRow = (type: AgendaItemType) => {
    const newItem: AgendaItem = {
      time: "",
      activity: type === AgendaItemType.SECTION_HEADER ? "NEW SECTION" : "New Activity",
      role: "...",
      duration: type === AgendaItemType.SECTION_HEADER ? "" : "5m",
      type: type,
    };
    setAgendaItems([...agendaItems, newItem]);
  };

  // --- Handlers: Toolbar ---

  const handlePrint = () => {
    // alert("Please ensure the page is scaled to fit one A4 page in the print preview before saving as PDF.");
    window.print();
  };

  const handleSave = () => {
    const data = {
      details,
      agendaItems,
      officers,
      date: { selectedWeekday, selectedMonth, selectedDay }
    };
    localStorage.setItem('tm_agenda_data', JSON.stringify(data));
    alert("Saved successfully! \n\nNote: This data is saved locally on this device only. Clearing your browser cache will delete it.");
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('tm_agenda_data');
    if (saved) {
      if(confirm("Load saved agenda? This will overwrite current changes.")) {
        try {
          const data = JSON.parse(saved);
          setDetails(data.details);
          setAgendaItems(data.agendaItems);
          setOfficers(data.officers);
          if(data.date) {
            setSelectedWeekday(data.date.selectedWeekday);
            setSelectedMonth(data.date.selectedMonth);
            setSelectedDay(data.date.selectedDay);
          }
        } catch (e) {
          alert("Error loading data.");
        }
      }
    } else {
      alert("No saved data found on this device.");
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default template? All changes will be lost.")) {
      setDetails(MEETING_DETAILS);
      setAgendaItems(AGENDA_ITEMS);
      setOfficers(OFFICERS);
      setSelectedWeekday("Sunday");
      setSelectedMonth("January");
      setSelectedDay("4");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 pb-20 pt-24 flex justify-center font-sans antialiased print:bg-white print:p-0 print:block">
      
      {/* --- Floating Toolbar --- */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded-lg shadow-2xl p-2 z-50 flex items-center gap-2 print:hidden transition-all">
        <button onClick={handleSave} className="flex flex-col items-center px-3 py-1 hover:bg-slate-700 rounded text-xs">
          <span className="text-lg">💾</span> Save
        </button>
        <button onClick={handleLoad} className="flex flex-col items-center px-3 py-1 hover:bg-slate-700 rounded text-xs">
          <span className="text-lg">📂</span> Restore
        </button>
         <div className="w-px h-8 bg-slate-600 mx-1"></div>
        <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="flex flex-col items-center px-3 py-1 hover:bg-slate-700 rounded text-xs">
          <span className="text-lg">➖</span> Zoom Out
        </button>
        <span className="text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))} className="flex flex-col items-center px-3 py-1 hover:bg-slate-700 rounded text-xs">
          <span className="text-lg">➕</span> Zoom In
        </button>
        <div className="w-px h-8 bg-slate-600 mx-1"></div>
        <button onClick={handleReset} className="flex flex-col items-center px-3 py-1 hover:bg-red-900 rounded text-xs text-red-200">
          <span className="text-lg">↺</span> Reset
        </button>
        <button onClick={handlePrint} className="flex flex-col items-center px-4 py-1 bg-tm-blue hover:bg-blue-800 rounded text-xs font-bold ml-2">
          <span className="text-lg">🖨️</span> Print
        </button>
      </div>

      {/* --- A4 Paper Container --- */}
      <div 
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-8 relative flex flex-col text-slate-800 print:shadow-none print:w-[210mm] print:h-[297mm] print:transform-none print:m-0 print:overflow-hidden"
      >
        
        {/* --- Decoration: Top Right --- */}
        <div className="absolute top-0 right-0 w-52 h-52 pointer-events-none overflow-hidden z-0 rounded-bl-[80px]">
           <svg viewBox="0 0 200 200" className="w-full h-full opacity-80" preserveAspectRatio="none">
              {/* Yellow Corner Circle */}
              <circle cx="200" cy="0" r="140" fill="#F2DF74" fillOpacity="0.3" />
              {/* Blue Curved Shape */}
              <path d="M200 0 L200 90 Q 140 90 90 40 Q 60 10 50 0 Z" fill="#004165" fillOpacity="0.15" />
              {/* Red Accent Line/Bar */}
              <rect x="185" y="0" width="15" height="120" fill="#772432" fillOpacity="0.8" />
              <rect x="100" y="0" width="100" height="8" fill="#772432" fillOpacity="0.4" />
           </svg>
        </div>

        {/* --- Decoration: Bottom Left --- */}
        <div className="absolute bottom-0 left-0 w-64 h-32 pointer-events-none overflow-hidden z-0">
           <svg viewBox="0 0 200 100" className="w-full h-full opacity-60" preserveAspectRatio="none">
              <path d="M0 100 L 0 20 Q 50 100 150 100 Z" fill="#004165" fillOpacity="0.1" />
              <circle cx="0" cy="100" r="60" fill="#F2DF74" fillOpacity="0.3" />
           </svg>
        </div>

        {/* --- Header Section --- */}
        <header className="border-b-2 border-tm-red/30 pb-4 mb-4 relative z-10">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-tm-blue tracking-wide leading-tight">汕头国际演讲俱乐部</h1>
              <h2 className="text-xl font-bold text-tm-red uppercase italic tracking-widest leading-tight">Shantou Toastmasters</h2>
              {/* Subtitle Moved Here */}
              <h3 className="text-sm font-bold text-tm-blue/60 tracking-wider mt-1 border-t border-tm-blue/10 pt-1 inline-block">
                粤东首家头马国际演讲俱乐部
              </h3>
            </div>
            
            <div className="bg-tm-red text-white px-4 py-2 rounded-sm font-bold text-xl shadow-sm print:bg-tm-red print:text-white print:print-color-adjust-exact mb-2">
              MTG# <span className="text-tm-yellow">
                <input 
                  type="number" 
                  value={details.number}
                  onChange={(e) => handleDetailChange('number', e.target.value)}
                  className="bg-transparent w-16 text-center outline-none text-tm-yellow placeholder-tm-yellow/50"
                />
              </span>
            </div>
          </div>
        </header>

        {/* --- Theme Section --- */}
        <div className="mb-6 relative z-10">
          <div className="flex items-baseline gap-2 mb-2 w-full">
            <h3 className="text-tm-blue font-bold text-lg uppercase whitespace-nowrap">THEME:</h3>
            <input 
              type="text"
              value={details.theme}
              onChange={(e) => handleDetailChange('theme', e.target.value)}
              className="text-tm-red font-serif font-bold italic text-2xl w-full bg-transparent border-b border-transparent focus:border-gray-300 outline-none placeholder-red-300/50"
              placeholder="Enter Theme Here"
            />
          </div>
          {/* Enhanced Quote Style */}
          <div className="bg-yellow-50/50 border-l-4 border-tm-blue p-4 mb-2 print:bg-transparent print:border-tm-blue rounded-r-md">
            <AutoResizeTextarea
              value={details.quote}
              onChange={(e: any) => handleDetailChange('quote', e.target.value)}
              className="w-full bg-transparent text-lg font-serif italic text-tm-blue placeholder-tm-blue/30 leading-relaxed font-medium"
              placeholder="Enter your quote here..."
            />
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-12 gap-6 flex-grow relative z-10">
          
          {/* LEFT COLUMN (Agenda) - Approx 60-65% */}
          <div className="col-span-7 flex flex-col">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-slate-500 font-bold border-b border-gray-200">
                  <th className="text-left py-2 w-12">Time</th>
                  <th className="text-left py-2">Activity</th>
                  <th className="text-right py-2 w-24">Role</th>
                  <th className="text-right py-2 w-10">Dur.</th>
                  <th className="w-6 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agendaItems.map((item, idx) => {
                  const isHeader = item.type === AgendaItemType.SECTION_HEADER;
                  
                  return (
                    <tr key={idx} className="hover:bg-blue-50/50 group print:hover:bg-transparent relative">
                      {isHeader ? (
                         <td colSpan={4} className="py-1">
                          <div className="bg-tm-red text-white font-bold text-xs uppercase py-1 rounded-sm shadow-sm mt-2 mb-1 flex justify-center print:bg-tm-red print:text-white print:print-color-adjust-exact">
                            <input
                              type="text"
                              value={item.activity}
                              onChange={(e) => handleAgendaChange(idx, 'activity', e.target.value)}
                              className="bg-transparent text-center text-white placeholder-white/70 outline-none w-full font-bold uppercase"
                            />
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="py-1 align-middle">
                            {idx === 0 ? (
                              <input
                                type="time"
                                value={details.time}
                                onChange={(e) => handleDetailChange('time', e.target.value)}
                                className="text-tm-blue font-bold text-xs font-mono bg-transparent outline-none w-full border-b border-transparent focus:border-tm-blue"
                              />
                            ) : (
                              <span className="text-tm-blue font-bold text-xs font-mono block py-1">{item.time}</span>
                            )}
                          </td>
                          <td className="py-1 align-middle">
                            <input
                              type="text"
                              value={item.activity}
                              onChange={(e) => handleAgendaChange(idx, 'activity', e.target.value)}
                              className="font-medium text-slate-800 bg-transparent w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-400"
                            />
                          </td>
                          <td className="py-1 align-middle">
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => handleAgendaChange(idx, 'role', e.target.value)}
                              className="text-right text-slate-600 italic text-xs bg-transparent w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-300"
                            />
                          </td>
                          <td className="py-1 align-middle">
                            <input
                              type="text"
                              value={item.duration}
                              onChange={(e) => handleAgendaChange(idx, 'duration', e.target.value)}
                              className="text-right text-slate-400 text-xs bg-transparent w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-200"
                            />
                          </td>
                        </>
                      )}
                      
                      {/* Row Controls (Hover) */}
                      <td className="print:hidden w-8 text-right align-middle">
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded p-1 z-10">
                           <button onClick={() => moveRow(idx, 'up')} className="text-[10px] bg-slate-100 hover:bg-slate-200 p-0.5 rounded" title="Move Up">▲</button>
                           <button onClick={() => moveRow(idx, 'down')} className="text-[10px] bg-slate-100 hover:bg-slate-200 p-0.5 rounded" title="Move Down">▼</button>
                           <button onClick={() => deleteRow(idx)} className="text-[10px] bg-red-100 text-red-600 hover:bg-red-200 p-0.5 rounded mt-1" title="Delete">✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Add Row Buttons */}
            <div className="mt-4 flex gap-2 print:hidden opacity-50 hover:opacity-100 transition-opacity">
               <button onClick={() => addRow(AgendaItemType.NORMAL)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 border border-blue-200 dashed">+ Add Activity</button>
               <button onClick={() => addRow(AgendaItemType.SECTION_HEADER)} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 border border-red-200 dashed">+ Add Section Header</button>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) - Approx 35-40% */}
          <div className="col-span-5 space-y-4">
            
            {/* LOGO REMOVED */}

            {/* Time & Venue Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-0 overflow-hidden shadow-sm print:bg-gray-50 print:border-gray-200">
              <div className="bg-white p-2 border-b border-gray-100 text-xs font-bold text-tm-blue uppercase flex items-center gap-1">
                 🕒 Time & Venue
              </div>
              <div className="p-3">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-700 gap-1 border-b border-gray-200 pb-1">
                     <div className="flex items-center gap-0.5 w-full">
                       {/* Compact, Integrated Date Selection */}
                       <select 
                        value={selectedWeekday}
                        onChange={(e) => setSelectedWeekday(e.target.value)}
                        className="bg-transparent border-none outline-none cursor-pointer hover:text-tm-blue appearance-none print:appearance-none font-sans p-0 pr-1 text-right"
                      >
                        {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <span>, </span>
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent border-none outline-none cursor-pointer hover:text-tm-blue appearance-none font-sans p-0 px-1"
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      
                       <input 
                        type="text" 
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="bg-transparent w-full min-w-[30px] flex-grow outline-none hover:text-tm-blue focus:border-b focus:border-gray-300 font-sans p-0 placeholder-gray-300"
                        placeholder="Day"
                      />
                     </div>
                  </div>
                </div>
                
                <div className="bg-tm-red text-white text-center text-2xl font-bold py-1 rounded mb-2 print:bg-tm-red print:text-white print:print-color-adjust-exact">
                   {details.time}
                </div>
                <div className="flex flex-col gap-1">
                  <AutoResizeTextarea
                    value={details.address}
                    onChange={(e: any) => handleDetailChange('address', e.target.value)}
                    className="text-xs text-slate-600 leading-tight w-full"
                  />
                </div>
              </div>
            </div>

            {/* Word of the Day */}
            <div className="rounded-lg overflow-hidden shadow-sm border border-tm-blue">
              <div className="bg-tm-blue text-white text-center text-xs font-bold py-1 uppercase tracking-widest print:bg-tm-blue print:text-white print:print-color-adjust-exact">
                Word of the Day
              </div>
              <div className="bg-tm-blue/90 p-3 text-center print:bg-tm-blue/90 print:print-color-adjust-exact">
                 <input 
                  type="text"
                  value={details.wordOfTheDay}
                  onChange={(e) => handleDetailChange('wordOfTheDay', e.target.value)}
                  className="text-tm-yellow font-bold italic text-xl tracking-wide bg-transparent text-center w-full outline-none placeholder-yellow-200/50 uppercase"
                  placeholder="WORD"
                />
              </div>
            </div>
            
            {/* Pricing Standard (New) */}
            <div className="border border-amber-200 rounded-lg overflow-hidden text-xs shadow-sm bg-[#FFF9E5] print:bg-[#FFF9E5] print:print-color-adjust-exact">
               <div className="text-tm-blue font-bold text-center py-1 italic border-b border-amber-100 text-sm">
                 $ Pricing Standard
               </div>
               <div className="p-2 text-center font-medium leading-tight">
                 <p className="text-slate-800 mb-1">Free for members, 38 RMB for visiting non-members.</p>
                 <p className="text-tm-red font-bold">(Free for first-time attendees)</p>
               </div>
            </div>

            {/* Time Rule Table (Read-only, Compacted) */}
            <div className="border border-gray-200 rounded overflow-hidden text-xs">
              <div className="bg-gray-50 p-1.5 font-bold text-tm-blue border-b border-gray-200 text-xs italic print:bg-gray-50">
                Time Rule
              </div>
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-gray-50 text-slate-600 border-b border-gray-200 print:bg-gray-50">
                    <th className="py-1 px-1 font-medium">Type</th>
                    <th className="py-1 px-1 font-medium border-l border-gray-200">Short<br/>Speech</th>
                    <th className="py-1 px-1 font-medium border-l border-gray-200">Long<br/>Speech</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-100 border-b border-white print:bg-green-100 print:print-color-adjust-exact">
                    <td className="py-0.5 font-bold text-green-800">Green</td>
                    <td className="py-0.5 text-green-800 border-l border-white">1 min left</td>
                    <td className="py-0.5 text-green-800 border-l border-white">2 min left</td>
                  </tr>
                  <tr className="bg-yellow-100 border-b border-white print:bg-yellow-100 print:print-color-adjust-exact">
                    <td className="py-0.5 font-bold text-yellow-800">Yellow</td>
                    <td className="py-0.5 text-yellow-800 border-l border-white">0.5 min left</td>
                    <td className="py-0.5 text-yellow-800 border-l border-white">1 min left</td>
                  </tr>
                  <tr className="bg-red-100 border-b border-white print:bg-red-100 print:print-color-adjust-exact">
                    <td className="py-0.5 font-bold text-tm-red">Red</td>
                    <td className="py-0.5 text-tm-red border-l border-white">Time is up</td>
                    <td className="py-0.5 text-tm-red border-l border-white">Time is up</td>
                  </tr>
                  <tr className="bg-gray-50 print:bg-gray-50">
                    <td className="py-0.5 font-medium text-slate-500">Grace</td>
                    <td className="py-0.5 text-slate-500 border-l border-gray-200">30 sec</td>
                    <td className="py-0.5 text-slate-500 border-l border-gray-200">30 sec</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reminder (Read-only) */}
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 print:bg-red-50/50 print:print-color-adjust-exact">
              <h4 className="text-tm-red font-bold italic mb-2 text-xs">Reminder</h4>
              <ol className="list-decimal list-inside text-[10px] space-y-1 text-slate-700 font-medium">
                {details.etiquette.map((rule, idx) => (
                  <li key={idx} className="pl-1 leading-tight">{rule}</li>
                ))}
              </ol>
            </div>

            {/* Officers (Editable Names) */}
            <div className="mt-4">
              <h4 className="text-tm-blue font-bold italic uppercase text-xs tracking-wider mb-2 border-b border-gray-200 pb-1">Club Officers</h4>
              <ul className="space-y-1 text-xs">
                {officers.map((officer, idx) => (
                  <li key={idx} className="flex justify-between items-center group">
                    <span className="text-slate-500 font-bold uppercase text-[10px] whitespace-nowrap mr-2">{officer.role}</span>
                    <input
                      type="text"
                      value={officer.name}
                      onChange={(e) => handleOfficerChange(idx, e.target.value)}
                      className="text-tm-red font-bold text-right bg-transparent outline-none w-full border-b border-transparent focus:border-tm-red/30 hover:border-gray-200 print:border-none placeholder-red-200"
                      placeholder="..."
                    />
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* --- Footer --- */}
        <div className="mt-auto pt-4 border-t-2 border-tm-yellow/50 relative z-10">
          <div className="text-center">
             <h4 className="text-tm-blue font-bold italic tracking-widest text-sm mb-1 uppercase">Club Mission</h4>
             <p className="text-[10px] text-slate-500 italic max-w-2xl mx-auto mb-4 leading-relaxed">
               "We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth."
             </p>

             <div className="text-xs font-bold text-tm-blue tracking-[0.5em] uppercase opacity-70">
               Connect Learn Grow
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}