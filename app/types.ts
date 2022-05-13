export interface Athlete {
  name: string;
  flag: string;
  citizenship: string;
  link: string;
}

export interface Venue {
  fullName: string;
  skipCityOrNameValidation: boolean;
}

export interface Location {
  venue: Venue;
}

export interface ScheduledEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  date: string;
  detail: string;
  description: string;
  status: string;
  link: string;
  athlete: Athlete;
  locations: Location[];
  purse: string;
  score: string;
  isMaj?: boolean;
}

export interface Competitor {
  guid: string;
  name: string;
  name$: string;
  lnk: string;
  flag: string;
  flagCountry: string;
  pts: number;
  $: string;
  $$: number;
  id: string;
  mv: number;
  order: number;
  pos: string;
  status: string;
  tee: string;
  thru: number;
  today: string;
  toPar: string;
  tot: number;
  uid: string;
  today$: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  img: string;
  cut?: boolean;
  detail: string;
  amateur?: boolean;
}

interface Course {
  [key: string]: { nm: string };
}

export interface Tournament {
  uid: string;
  id: string;
  name: string;
  season: number;
  tour: string;
  isOly: boolean;
  dataFormat: string;
  numRounds: number;
  currentRound: number;
  maj: boolean;
  status: string;
  canc: boolean;
  roundStatus: string;
  roundStatusDetail: string;
  competitors: Competitor[];
  rawText: string;
  hasPlayerStats: boolean;
  hasCourseStats: boolean;
  holeByHoleSourceId: string;
  scoringSystem: string;
  athleteAirings: any[];
  courses: Course;
}
