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

export const isHoliday = (date: Date, holidays: Date[]): boolean => {
  return (
    holidays.some(
      (holiday) =>
        holiday.getFullYear() === date.getFullYear() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getDate() === date.getDate()
    ) ||
    isWeekend(date) ||
    isSecondOrFourthSaturday(date)
  );
};

export const generateDaySchedule = (
  date: Date,
  subjects: Subject[],
  holidays: Date[]
): DaySchedule => {
  const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    date.getDay()
  ];
  const classes: ClassSession[] = [];

  if (isHoliday(date, holidays)) {
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
  holidays: Date[]
): DaySchedule[] => {
  const schedule: DaySchedule[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    schedule.push(
      generateDaySchedule(new Date(currentDate), subjects, holidays)
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
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
