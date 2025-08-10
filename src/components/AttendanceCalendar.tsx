import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";
import { useSemester } from "../contexts/SemesterContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AttendanceCalendar: React.FC = () => {
  const { semester, schedule } = useSemester();
  const [value, setValue] = useState<Value>(new Date());

  if (!semester) return null;

  const getTileClassName = ({ date }: { date: Date }) => {
    const daySchedule = schedule.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    if (!daySchedule) return "";

    if (daySchedule.isHoliday) {
      return "calendar-tile-holiday";
    }

    if (daySchedule.classes.length === 0) return "";

    const attendedClasses = daySchedule.classes.filter(
      (cls) => cls.attended
    ).length;
    const totalClasses = daySchedule.classes.length;
    const attendanceRate = attendedClasses / totalClasses;

    if (attendanceRate === 1) {
      return "calendar-tile-full-attendance";
    } else if (attendanceRate >= 0.75) {
      return "calendar-tile-good-attendance";
    } else if (attendanceRate > 0) {
      return "calendar-tile-partial-attendance";
    } else {
      return "calendar-tile-no-attendance";
    }
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const daySchedule = schedule.find(
      (day) => day.date.toDateString() === date.toDateString()
    );

    if (
      !daySchedule ||
      daySchedule.isHoliday ||
      daySchedule.classes.length === 0
    ) {
      return null;
    }

    const attendedClasses = daySchedule.classes.filter(
      (cls) => cls.attended
    ).length;
    const totalClasses = daySchedule.classes.length;

    return (
      <div className="text-xs mt-1">
        <div className="font-semibold">
          {attendedClasses}/{totalClasses}
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-calendar">
      {/* Temporarily hide custom header to debug
      <div className="calendar-weekdays-header mb-2">
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
          <div className="py-2">Sun</div>
          <div className="py-2">Mon</div>
          <div className="py-2">Tue</div>
          <div className="py-2">Wed</div>
          <div className="py-2">Thu</div>
          <div className="py-2">Fri</div>
          <div className="py-2">Sat</div>
        </div>
      </div>
      */}

      <CustomCalendar
        onChange={(date) => setValue(date)}
        value={value as Date}
        tileClassName={getTileClassName}
        tileContent={getTileContent}
        minDate={semester.startDate}
        maxDate={semester.endDate}
      />

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Legend
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded shadow-sm"></div>
            <span className="font-medium text-gray-700">Full Attendance</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded shadow-sm"></div>
            <span className="font-medium text-gray-700">75%+ Attendance</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded shadow-sm"></div>
            <span className="font-medium text-gray-700">
              Partial Attendance
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded shadow-sm"></div>
            <span className="font-medium text-gray-700">No Attendance</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-gray-300 to-gray-400 rounded shadow-sm"></div>
            <span className="font-medium text-gray-700">Holiday</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded shadow-sm ring-2 ring-blue-200"></div>
            <span className="font-medium text-gray-700">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
