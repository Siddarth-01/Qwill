import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomCalendarProps {
  minDate?: Date;
  maxDate?: Date;
  tileClassName?: (props: { date: Date }) => string;
  tileContent?: (props: { date: Date }) => React.ReactNode;
  value?: Date;
  onChange?: (date: Date) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  minDate,
  maxDate,
  tileClassName,
  tileContent,
  value,
  onChange,
}) => {
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-3"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const className = tileClassName ? tileClassName({ date }) : "";
      const content = tileContent ? tileContent({ date }) : null;

      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push(
        <div
          key={day}
          className={`p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors min-h-[80px] flex flex-col items-center justify-start ${className} ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (!isDisabled && onChange) {
              onChange(date);
            }
          }}
        >
          <span className="text-sm font-medium">{day}</span>
          {content}
        </div>
      );
    }

    return days;
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
        </h2>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">{renderCalendar()}</div>
    </div>
  );
};

export default CustomCalendar;
