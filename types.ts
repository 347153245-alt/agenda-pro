export enum AgendaItemType {
  NORMAL = 'NORMAL',
  SECTION_HEADER = 'SECTION_HEADER',
  BREAK = 'BREAK'
}

export interface AgendaItem {
  time: string;
  activity: string;
  role: string;
  name?: string; // Name of the speaker/person
  duration: string;
  type: AgendaItemType;
  highlight?: boolean;
}

export interface Officer {
  role: string;
  name: string;
}

export interface MeetingDetails {
  clubName: string;
  number: number;
  theme: string;
  quote: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  wordOfTheDay: string;
  wordDefinition: string;
  zoomId?: string;
  zoomPwd?: string;
  etiquette: string[];
}

export interface TimeRule {
  color: string;
  min: number;
  max: number;
}