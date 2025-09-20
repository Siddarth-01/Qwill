export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Subject {
  id: string;
  name: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  slotNumbers: number[];
  duration: number; // in hours
}

export interface Semester {
  id: string;
  startDate: Date;
  endDate: Date;
  subjects: Subject[];
  holidays: Date[];
  customHolidays: CustomHoliday[];
  excludedAutoHolidays: Date[]; // New field to track excluded auto-generated holidays
}

export interface CustomHoliday {
  id: string;
  date: Date;
  name: string;
  description?: string | null;
}

export interface DaySchedule {
  date: Date;
  classes: ClassSession[];
  isHoliday: boolean;
  holidayName?: string;
  isHomeDay?: boolean; // New field to track home days
}

export interface ClassSession {
  id: string;
  subjectId: string;
  subjectName: string;
  slotNumber: number;
  duration: number;
  attended: boolean;
  canEdit: boolean; // based on current date
  plannedSkip?: boolean; // for future attendance planning
}

export interface AttendanceStats {
  totalUnits: number;
  attendedUnits: number;
  percentage: number;
  requiredUnits: number; // for 75%
  unitsCanSkip: number;
}

export interface SubjectAttendance {
  subjectId: string;
  subjectName: string;
  stats: AttendanceStats;
}

export interface FutureAttendancePlan {
  targetDate: Date;
  assumeAllAttended: boolean;
  skipDates: Date[];
  skipClasses: string[]; // class session IDs
  projectedStats: AttendanceStats;
}
