import { AgendaItem, AgendaItemType, MeetingDetails, Officer } from './types';

export const MEETING_DETAILS: MeetingDetails = {
  clubName: "Shantou Toastmasters",
  number: 47,
  theme: "New Year Wishes",
  quote: "Great things never came from comfort zones. Let us explore our potential together in this wonderful meeting session.",
  date: "Sunday, January 4",
  time: "07:30",
  venue: "ZHISHU SPACE",
  address: "汕头市龙湖区梅溪西路2号知书空间\nZHISHU SPACE, MEIXI WEST ROAD NO. 2",
  wordOfTheDay: "FORWARD-LOOKING",
  wordDefinition: "", 
  etiquette: [
    "Please turn off your mobile phone or turn it into silent mode!",
    "Do not talk about topics of Politics, Religion or Sex!",
    "Do not walk around when speakers present their speeches!",
    "Please shake hands on and off the stage."
  ]
};

export const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const OFFICERS: Officer[] = [
  { role: "PRESIDENT", name: "Christina Chen" },
  { role: "VP EDUCATION", name: "Ellie Ding" },
  { role: "VP MEMBERSHIP", name: "Namen Zhou" },
  { role: "VP PUBLIC RELATIONS", name: "Alexandra Huang" },
  { role: "SECRETARY", name: "Melody Mei" },
  { role: "TREASURER", name: "Harriet Zeng" },
  { role: "SERGEANT AT ARMS", name: "Jason Chen" },
];

export const AGENDA_ITEMS: AgendaItem[] = [
  { time: "07:30", activity: "Reception", role: "Reception Team", duration: "15m", type: AgendaItemType.NORMAL },
  { time: "07:45", activity: "Meeting Preparation", role: "...", duration: "15m", type: AgendaItemType.NORMAL },
  { time: "08:00", activity: "Opening Remark", role: "...", duration: "3m", type: AgendaItemType.NORMAL },
  { time: "08:03", activity: "Timer Introduction", role: "...", duration: "2m", type: AgendaItemType.NORMAL },
  { time: "08:05", activity: "Grammarian Introduction", role: "...", duration: "2m", type: AgendaItemType.NORMAL },
  { time: "08:07", activity: "General Evaluator Introduction", role: "...", duration: "2m", type: AgendaItemType.NORMAL },
  { time: "08:09", activity: "Guest Introduction & Icebreak", role: "...", duration: "15m", type: AgendaItemType.NORMAL },
  
  { time: "", activity: "PREPARED SPEECH", role: "", duration: "", type: AgendaItemType.SECTION_HEADER },
  { time: "08:24", activity: "Project Speech #1", role: "...", duration: "7m", type: AgendaItemType.NORMAL },
  { time: "08:31", activity: "Project Speech #2", role: "...", duration: "7m", type: AgendaItemType.NORMAL },
  { time: "08:38", activity: "Evaluation Speech", role: "...", duration: "3m", type: AgendaItemType.NORMAL },
  { time: "08:41", activity: "Evaluation Speech", role: "...", duration: "3m", type: AgendaItemType.NORMAL },
  { time: "08:44", activity: "Group Photo", role: "...", duration: "10m", type: AgendaItemType.NORMAL },
  
  { time: "", activity: "BREAK TIME 10 MIN", role: "", duration: "", type: AgendaItemType.SECTION_HEADER },
  { time: "08:54", activity: "Table Topic Speeches", role: "...", duration: "30m", type: AgendaItemType.NORMAL },
  { time: "09:24", activity: "Table Topic Evaluation", role: "...", duration: "6m", type: AgendaItemType.NORMAL },
  { time: "09:30", activity: "Timer Report", role: "...", duration: "3m", type: AgendaItemType.NORMAL },
  { time: "09:33", activity: "Grammarian Report", role: "...", duration: "3m", type: AgendaItemType.NORMAL },
  { time: "09:36", activity: "General Evaluator Report", role: "...", duration: "10m", type: AgendaItemType.NORMAL },
  
  { time: "", activity: "CONCLUSION", role: "", duration: "", type: AgendaItemType.SECTION_HEADER },
  { time: "09:46", activity: "Voting for Best Facilitator", role: "...", duration: "1.5m", type: AgendaItemType.NORMAL },
  { time: "09:48", activity: "Moment of Truth", role: "...", duration: "5m", type: AgendaItemType.NORMAL },
  { time: "09:53", activity: "Awards", role: "...", duration: "2m", type: AgendaItemType.NORMAL },
];