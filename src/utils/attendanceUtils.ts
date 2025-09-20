import type {
  AttendanceStats,
  ClassSession,
  DaySchedule,
  Subject,
} from "../types";

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0; // Sunday
};

export const isSecondOrFourthSaturday = (date: Date): boolean => {
  if (date.getDay() !== 6) return false; // Not Saturday

  const dateNum = date.getDate();
  const weekOfMonth = Math.ceil(dateNum / 7);
  return weekOfMonth === 2 || weekOfMonth === 4;
};

export const isHoliday = (
  date: Date,
  holidays: Date[],
  excludedAutoHolidays: Date[] = []
): boolean => {
  // Check if this auto-generated holiday has been excluded
  const isExcludedAutoHoliday = excludedAutoHolidays.some(
    (excluded) =>
      excluded.getFullYear() === date.getFullYear() &&
      excluded.getMonth() === date.getMonth() &&
      excluded.getDate() === date.getDate()
  );

  const isAutoHoliday = isWeekend(date) || isSecondOrFourthSaturday(date);

  // If it's an auto-holiday but has been excluded, don't treat as holiday
  if (isAutoHoliday && isExcludedAutoHoliday) {
    return false;
  }

  return (
    holidays.some(
      (holiday) =>
        holiday.getFullYear() === date.getFullYear() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getDate() === date.getDate()
    ) || isAutoHoliday
  );
};

export const generateDaySchedule = (
  date: Date,
  subjects: Subject[],
  holidays: Date[],
  excludedAutoHolidays: Date[] = []
): DaySchedule => {
  const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    date.getDay()
  ];
  const classes: ClassSession[] = [];

  if (isHoliday(date, holidays, excludedAutoHolidays)) {
    return {
      date,
      classes: [],
      isHoliday: true,
      holidayName: getHolidayName(date),
    };
  }

  subjects.forEach((subject) => {
    subject.slots.forEach((slot) => {
      if (slot.day === dayName) {
        slot.slotNumbers.forEach((slotNumber) => {
          classes.push({
            id: `${subject.id}-${
              date.toISOString().split("T")[0]
            }-${slotNumber}`,
            subjectId: subject.id,
            subjectName: subject.name,
            slotNumber,
            duration: slot.duration / slot.slotNumbers.length,
            attended: false,
            canEdit: date <= new Date(),
          });
        });
      }
    });
  });

  return {
    date,
    classes: classes.sort((a, b) => a.slotNumber - b.slotNumber),
    isHoliday: false,
  };
};

export const getHolidayName = (date: Date): string => {
  if (isWeekend(date)) return "Sunday";
  if (isSecondOrFourthSaturday(date)) return "2nd/4th Saturday";
  return "Holiday";
};

export const calculateAttendanceStats = (
  classes: ClassSession[],
  requiredPercentage: number = 75
): AttendanceStats => {
  const totalUnits = classes.reduce((sum, cls) => sum + cls.duration, 0);
  const attendedUnits = classes
    .filter((cls) => cls.attended)
    .reduce((sum, cls) => sum + cls.duration, 0);

  const percentage = totalUnits > 0 ? (attendedUnits / totalUnits) * 100 : 0;
  const requiredUnits = Math.ceil((totalUnits * requiredPercentage) / 100);
  const unitsCanSkip = Math.max(0, attendedUnits - requiredUnits);

  return {
    totalUnits,
    attendedUnits,
    percentage,
    requiredUnits,
    unitsCanSkip,
  };
};

export const getSubjectAttendance = (
  classes: ClassSession[],
  subjects: Subject[]
): { subjectId: string; subjectName: string; stats: AttendanceStats }[] => {
  return subjects.map((subject) => {
    const subjectClasses = classes.filter(
      (cls) => cls.subjectId === subject.id
    );
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      stats: calculateAttendanceStats(subjectClasses),
    };
  });
};

export const generateScheduleForPeriod = (
  startDate: Date,
  endDate: Date,
  subjects: Subject[],
  holidays: Date[],
  excludedAutoHolidays: Date[] = []
): DaySchedule[] => {
  const schedule: DaySchedule[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    schedule.push(
      generateDaySchedule(
        new Date(currentDate),
        subjects,
        holidays,
        excludedAutoHolidays
      )
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
};

export const generateInitialAttendanceData = (
  schedule: DaySchedule[],
  targetRatios: Record<string, { attended: number; total: number }>
): Record<string, boolean> => {
  const attendanceData: Record<string, boolean> = {};

  // Get all classes until today (August 10, 2025)
  const today = new Date("2025-08-10");
  const classesToDate = schedule
    .filter((day) => day.date <= today)
    .flatMap((day) => day.classes)
    .sort(
      (a, b) =>
        new Date(a.id.split("-")[1]).getTime() -
        new Date(b.id.split("-")[1]).getTime()
    );

  // Group classes by subject
  const classesBySubject: Record<string, typeof classesToDate> = {};
  classesToDate.forEach((cls) => {
    const subjectName = cls.subjectName;
    if (!classesBySubject[subjectName]) {
      classesBySubject[subjectName] = [];
    }
    classesBySubject[subjectName].push(cls);
  });

  // For each subject, mark attendance based on target ratios
  Object.entries(classesBySubject).forEach(([subjectName, classes]) => {
    const target = targetRatios[subjectName];
    if (target && classes.length > 0) {
      // Calculate how many classes to mark as attended
      const totalClassesToDate = classes.length;
      const targetAttended = Math.min(target.attended, totalClassesToDate);

      // Mark the first 'targetAttended' classes as attended
      classes.forEach((cls, index) => {
        attendanceData[cls.id] = index < targetAttended;
      });
    } else {
      // If no target specified, mark all as attended
      classes.forEach((cls) => {
        attendanceData[cls.id] = true;
      });
    }
  });

  return attendanceData;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};
