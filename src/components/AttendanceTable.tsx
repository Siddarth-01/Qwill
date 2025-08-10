import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Calendar,
  Trash2,
} from "lucide-react";
import { useSemester } from "../contexts/SemesterContext";
import { formatDate } from "../utils/attendanceUtils";

const AttendanceTable: React.FC = () => {
  const {
    schedule,
    updateAttendance,
    addCustomHoliday,
    removeCustomHoliday,
    semester,
  } = useSemester();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");

  const weeklySchedule = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - today.getDay() + currentWeekOffset * 7
    );

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const daySchedule = schedule.find(
        (day) => day.date.toDateString() === date.toDateString()
      );

      weekDays.push({
        date,
        schedule: daySchedule || { date, classes: [], isHoliday: false },
      });
    }

    return weekDays;
  }, [schedule, currentWeekOffset]);

  const handleAttendanceToggle = async (
    classId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateAttendance(classId, !currentStatus);
    } catch (error) {
      console.error("Failed to update attendance:", error);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  const handleMarkAsHoliday = (date: Date) => {
    setSelectedDate(date);
    setShowHolidayModal(true);
  };

  const handleRemoveHoliday = async (date: Date) => {
    if (!semester) return;

    const holiday = semester.customHolidays.find(
      (h) => h.date.toDateString() === date.toDateString()
    );

    if (holiday) {
      await removeCustomHoliday(holiday.id);
    }
  };

  const handleSaveHoliday = async () => {
    if (!selectedDate || !holidayName.trim()) {
      console.log("Missing required data:", { selectedDate, holidayName });
      return;
    }

    try {
      console.log("Saving holiday:", {
        date: selectedDate,
        name: holidayName.trim(),
        description: holidayDescription.trim() || undefined,
      });

      await addCustomHoliday({
        date: selectedDate,
        name: holidayName.trim(),
        description: holidayDescription.trim() || undefined,
      });

      console.log("Holiday saved successfully");

      setShowHolidayModal(false);
      setSelectedDate(null);
      setHolidayName("");
      setHolidayDescription("");
    } catch (error) {
      console.error("Error saving holiday:", error);
      alert("Failed to save holiday. Please try again.");
    }
  };

  const isCustomHoliday = (date: Date) => {
    return (
      semester?.customHolidays.some(
        (h) => h.date.toDateString() === date.toDateString()
      ) || false
    );
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <button
          onClick={goToPreviousWeek}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-gray-900 text-lg">
            {formatDate(weeklySchedule[0]?.date)} -{" "}
            {formatDate(weeklySchedule[6]?.date)}
          </h3>
          {currentWeekOffset !== 0 && (
            <button
              onClick={goToCurrentWeek}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Go to current week
            </button>
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Schedule */}
      <div className="space-y-4 max-h-[32rem] overflow-y-auto custom-scrollbar">
        {weeklySchedule.map(({ date, schedule: daySchedule }) => (
          <div
            key={date.toDateString()}
            className={`rounded-xl p-5 border-2 transition-all duration-200 hover:shadow-md ${
              daySchedule.isHoliday
                ? "bg-gray-50/50 border-gray-200"
                : "bg-white border-gray-100 hover:border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    daySchedule.isHoliday
                      ? "bg-gray-400"
                      : daySchedule.classes.length > 0
                      ? daySchedule.classes.filter((c) => c.attended).length ===
                        daySchedule.classes.length
                        ? "bg-green-400"
                        : daySchedule.classes.filter((c) => c.attended).length >
                          0
                        ? "bg-yellow-400"
                        : "bg-red-400"
                      : "bg-blue-400"
                  }`}
                ></div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {daySchedule.isHoliday ? (
                  <>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {daySchedule.holidayName || "Holiday"}
                    </span>
                    {isCustomHoliday(date) && (
                      <button
                        onClick={() => handleRemoveHoliday(date)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove custom holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleMarkAsHoliday(date)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Mark as custom holiday"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Mark Holiday</span>
                  </button>
                )}
              </div>
            </div>

            {daySchedule.classes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 italic text-sm">
                  {daySchedule.isHoliday
                    ? "🎉 No classes - Holiday"
                    : "📅 No classes scheduled"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {daySchedule.classes.map((classSession) => (
                  <div
                    key={classSession.id}
                    className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl border transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            classSession.attended
                              ? "bg-green-400"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="font-semibold text-gray-900">
                          {classSession.subjectName}
                        </span>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-lg">
                          Slot {classSession.slotNumber}
                        </span>
                        <span className="badge-info">
                          {classSession.duration}h
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleAttendanceToggle(
                          classSession.id,
                          classSession.attended
                        )
                      }
                      disabled={!classSession.canEdit}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                        classSession.attended
                          ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
                      } ${
                        classSession.canEdit
                          ? "hover:border-green-400 cursor-pointer hover:scale-105 hover:shadow-md"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {classSession.attended ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {daySchedule.classes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Attended:{" "}
                    {daySchedule.classes.filter((c) => c.attended).length} /{" "}
                    {daySchedule.classes.length}
                  </span>
                  <span
                    className={`font-medium ${
                      daySchedule.classes.filter((c) => c.attended).length ===
                      daySchedule.classes.length
                        ? "text-green-600"
                        : daySchedule.classes.filter((c) => c.attended).length >
                          0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {daySchedule.classes.length > 0
                      ? Math.round(
                          (daySchedule.classes.filter((c) => c.attended)
                            .length /
                            daySchedule.classes.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mark as Custom Holiday
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g., Diwali, Christmas, Personal Day"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  placeholder="Additional details about this holiday"
                  className="input-field resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHoliday}
                disabled={!holidayName.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
