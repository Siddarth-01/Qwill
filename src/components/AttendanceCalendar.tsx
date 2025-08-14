import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";
import { useSemester } from "../contexts/SemesterContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AttendanceCalendar: React.FC = () => {
  const { semester, schedule, toggleHomeDay } = useSemester();
  const [value, setValue] = useState<Value>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (!semester) return null;

  const handleDateClick = (date: Date) => {
    setValue(date);
    setSelectedDate(date);

    // Find the schedule for this date
    const daySchedule = schedule.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    if (daySchedule && daySchedule.classes.length > 0) {
      console.log(`Clicked on ${date.toDateString()}`, daySchedule);
      // You could add logic here to show a modal or navigate to detailed view
    }
  };

  const handleDateRightClick = async (date: Date, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent context menu
    try {
      await toggleHomeDay(date);
    } catch (error) {
      console.error("Failed to toggle home day:", error);
    }
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const daySchedule = schedule.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    let baseClass = "";

    // Add selected date styling
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      baseClass += " ring-2 ring-blue-500 ring-offset-2 ";
    }

    if (!daySchedule) return baseClass;

    if (daySchedule.isHoliday) {
      return baseClass + "calendar-tile-holiday";
    }

    if (daySchedule.classes.length === 0) return baseClass;

    // Check if this is a past date or future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tileDate = new Date(date);
    tileDate.setHours(0, 0, 0, 0);
    const isPastDate = tileDate < today;
    const isFutureDate = tileDate > today;

    if (isPastDate) {
      // For past dates, show actual attendance
      const attendedClasses = daySchedule.classes.filter(
        (cls) => cls.attended
      ).length;
      const totalClasses = daySchedule.classes.length;
      const attendanceRate = attendedClasses / totalClasses;

      if (attendanceRate === 1) {
        return baseClass + "calendar-tile-full-attendance";
      } else if (attendanceRate >= 0.75) {
        return baseClass + "calendar-tile-good-attendance";
      } else if (attendanceRate > 0) {
        return baseClass + "calendar-tile-partial-attendance";
      } else {
        return baseClass + "calendar-tile-no-attendance";
      }
    } else if (isFutureDate) {
      // For future dates, show planned skips
      const plannedSkipClasses = daySchedule.classes.filter(
        (cls) => cls.plannedSkip
      ).length;
      const totalClasses = daySchedule.classes.length;
      const skipRate = plannedSkipClasses / totalClasses;

      if (skipRate === 0) {
        return baseClass + "calendar-tile-planned-attend";
      } else if (skipRate < 0.5) {
        return baseClass + "calendar-tile-partial-skip";
      } else if (skipRate < 1) {
        return baseClass + "calendar-tile-mostly-skip";
      } else {
        return baseClass + "calendar-tile-full-skip";
      }
    } else {
      // Today - show actual attendance status like past dates
      const attendedClasses = daySchedule.classes.filter(
        (cls) => cls.attended
      ).length;
      const totalClasses = daySchedule.classes.length;
      const attendanceRate = attendedClasses / totalClasses;

      if (attendanceRate === 1) {
        return baseClass + "calendar-tile-full-attendance";
      } else if (attendanceRate >= 0.75) {
        return baseClass + "calendar-tile-good-attendance";
      } else if (attendanceRate > 0) {
        return baseClass + "calendar-tile-partial-attendance";
      } else {
        return baseClass + "calendar-tile-no-attendance";
      }
    }
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const daySchedule = schedule.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    // Show home day tag if it's marked as a home day
    const homeTag = daySchedule?.isHomeDay ? (
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[12px] md:border-l-[16px] border-l-transparent border-t-[12px] md:border-t-[16px] border-t-orange-500 shadow-sm"></div>
    ) : null;

    if (
      !daySchedule ||
      daySchedule.isHoliday ||
      daySchedule.classes.length === 0
    ) {
      return homeTag;
    }

    // Check if this is a past date or future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tileDate = new Date(date);
    tileDate.setHours(0, 0, 0, 0);
    const isPastDate = tileDate < today;
    const isFutureDate = tileDate > today;

    if (isPastDate) {
      // For past dates, show actual attendance
      const attendedClasses = daySchedule.classes.filter(
        (cls) => cls.attended
      ).length;
      const totalClasses = daySchedule.classes.length;

      return (
        <>
          {homeTag}
          <div className="text-xs mt-0.5">
            <div className="font-semibold text-xs">
              {attendedClasses}/{totalClasses}
            </div>
          </div>
        </>
      );
    } else if (isFutureDate) {
      // For future dates, show planned skips
      const plannedSkipClasses = daySchedule.classes.filter(
        (cls) => cls.plannedSkip
      ).length;
      const totalClasses = daySchedule.classes.length;

      return (
        <>
          {homeTag}
          <div className="text-xs mt-0.5">
            <div className="font-semibold text-xs">
              {plannedSkipClasses > 0
                ? `${plannedSkipClasses}/${totalClasses}`
                : `${totalClasses}`}
            </div>
            {plannedSkipClasses > 0 && (
              <div className="text-xs opacity-75">skip</div>
            )}
          </div>
        </>
      );
    } else {
      // Today
      const attendedClasses = daySchedule.classes.filter(
        (cls) => cls.attended
      ).length;
      const totalClasses = daySchedule.classes.length;

      return (
        <>
          {homeTag}
          <div className="text-xs mt-0.5">
            <div className="font-semibold text-xs">
              {attendedClasses}/{totalClasses}
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="attendance-calendar px-2 md:px-0">
      {/* Temporarily hide custom header to debug
      <div className="calendar-weekdays-header mb-2">
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
          <div className="py-2">Mon</div>
          <div className="py-2">Tue</div>
          <div className="py-2">Wed</div>
          <div className="py-2">Thu</div>
          <div className="py-2">Fri</div>
          <div className="py-2">Sat</div>
          <div className="py-2">Sun</div>
        </div>
      </div>
      */}

      <CustomCalendar
        onChange={handleDateClick}
        onContextMenu={handleDateRightClick}
        value={value as Date}
        tileClassName={getTileClassName}
        tileContent={getTileContent}
        minDate={semester.startDate}
        maxDate={semester.endDate}
      />
    </div>
  );
};

export default AttendanceCalendar;
