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
import {
  formatDate,
  isSecondOrFourthSaturday,
  isWeekend,
} from "../utils/attendanceUtils";

const AttendanceTable: React.FC = () => {
  const {
    schedule,
    updateAttendance,
    addCustomHoliday,
    removeCustomHoliday,
    removeAutoHoliday,
    restoreAutoHoliday,
    semester,
  } = useSemester();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Track which day of the week is selected
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

  const isExcludedAutoHoliday = (date: Date) => {
    return (
      semester?.excludedAutoHolidays?.some(
        (h) => h.toDateString() === date.toDateString()
      ) || false
    );
  };

  const handleRemoveAutoHoliday = async (date: Date) => {
    try {
      await removeAutoHoliday(date);
    } catch (error) {
      console.error("Failed to remove auto holiday:", error);
    }
  };

  const handleRestoreAutoHoliday = async (date: Date) => {
    try {
      await restoreAutoHoliday(date);
    } catch (error) {
      console.error("Failed to restore auto holiday:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-4">
      {/* Week Navigation - Always Available */}
      <div className="flex items-center justify-between p-3 md:p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-lg border border-blue-100">
        <button
          onClick={goToPreviousWeek}
          className="p-2 md:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg md:rounded-lg transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-gray-900 text-sm md:text-sm">
            {formatDate(weeklySchedule[0]?.date)} -{" "}
            {formatDate(weeklySchedule[6]?.date)}
          </h3>
          {currentWeekOffset !== 0 && (
            <button
              onClick={goToCurrentWeek}
              className="text-xs md:text-xs text-blue-600 hover:text-blue-700 mt-1 px-2 md:px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md md:rounded-md transition-colors"
            >
              Current week
            </button>
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 md:p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg md:rounded-lg transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="grid grid-cols-7 gap-1 md:gap-0.5 p-2 md:p-1.5 bg-gray-50 rounded-lg md:rounded-lg">
        {weeklySchedule.map(({ date, schedule: daySchedule }, index) => {
          const isSelected = index === selectedDayIndex;
          const isToday = date.toDateString() === new Date().toDateString();
          const hasClasses = daySchedule.classes.length > 0;
          const attendanceRate = hasClasses
            ? daySchedule.classes.filter((c) => c.attended).length /
              daySchedule.classes.length
            : 0;

          return (
            <button
              key={date.toDateString()}
              onClick={() => setSelectedDayIndex(index)}
              className={`p-2 md:p-1.5 rounded-lg md:rounded-md text-center transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="text-xs md:text-xs font-medium">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-xs md:text-xs font-bold">
                {date.getDate()}
              </div>
              {/* Status indicator */}
              <div
                className={`w-1.5 h-1.5 md:w-1 md:h-1 rounded-full mx-auto mt-1 ${
                  daySchedule.isHoliday
                    ? "bg-gray-400"
                    : !hasClasses
                    ? "bg-blue-300"
                    : attendanceRate === 1
                    ? isSelected
                      ? "bg-green-200"
                      : "bg-green-400"
                    : attendanceRate > 0
                    ? isSelected
                      ? "bg-yellow-200"
                      : "bg-yellow-400"
                    : isSelected
                    ? "bg-red-200"
                    : "bg-red-400"
                }`}
              ></div>
              {isToday && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  Today
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Schedule */}
      <div className="min-h-[20rem] md:min-h-[18rem]">
        {weeklySchedule[selectedDayIndex] && (
          <div
            className={`rounded-lg md:rounded-md p-4 md:p-3 border-2 transition-all duration-200 ${
              weeklySchedule[selectedDayIndex].schedule.isHoliday
                ? "bg-gray-50/50 border-gray-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4 md:mb-3">
              <div className="flex items-center gap-3 md:gap-2">
                <div
                  className={`w-3 h-3 md:w-2.5 md:h-2.5 rounded-full ${
                    weeklySchedule[selectedDayIndex].schedule.isHoliday
                      ? "bg-gray-400"
                      : weeklySchedule[selectedDayIndex].schedule.classes
                          .length > 0
                      ? weeklySchedule[
                          selectedDayIndex
                        ].schedule.classes.filter((c) => c.attended).length ===
                        weeklySchedule[selectedDayIndex].schedule.classes.length
                        ? "bg-green-400"
                        : weeklySchedule[
                            selectedDayIndex
                          ].schedule.classes.filter((c) => c.attended).length >
                          0
                        ? "bg-yellow-400"
                        : "bg-red-400"
                      : "bg-blue-400"
                  }`}
                ></div>
                <h4 className="font-bold text-gray-900 text-lg md:text-base">
                  {weeklySchedule[selectedDayIndex].date.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </h4>
              </div>

              <div className="flex items-center gap-2 md:gap-1.5">
                {weeklySchedule[selectedDayIndex].schedule.isHoliday ? (
                  <>
                    <span className="text-sm md:text-xs text-gray-500 bg-gray-100 px-3 md:px-2 py-1.5 md:py-1 rounded-full font-medium">
                      {weeklySchedule[selectedDayIndex].schedule.holidayName ||
                        "Holiday"}
                    </span>
                    {/* Show delete button for custom holidays */}
                    {isCustomHoliday(weeklySchedule[selectedDayIndex].date) && (
                      <button
                        onClick={() =>
                          handleRemoveHoliday(
                            weeklySchedule[selectedDayIndex].date
                          )
                        }
                        className="p-2 md:p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove custom holiday"
                      >
                        <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      </button>
                    )}
                    {/* Show delete button for 2nd/4th Saturday holidays */}
                    {isSecondOrFourthSaturday(
                      weeklySchedule[selectedDayIndex].date
                    ) &&
                      !isExcludedAutoHoliday(
                        weeklySchedule[selectedDayIndex].date
                      ) && (
                        <button
                          onClick={() =>
                            handleRemoveAutoHoliday(
                              weeklySchedule[selectedDayIndex].date
                            )
                          }
                          className="p-2 md:p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                          title="Remove 2nd/4th Saturday holiday"
                        >
                          <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        </button>
                      )}
                  </>
                ) : (
                  <>
                    {/* Show restore button for excluded auto holidays */}
                    {(isSecondOrFourthSaturday(
                      weeklySchedule[selectedDayIndex].date
                    ) ||
                      isWeekend(weeklySchedule[selectedDayIndex].date)) &&
                      isExcludedAutoHoliday(
                        weeklySchedule[selectedDayIndex].date
                      ) && (
                        <button
                          onClick={() =>
                            handleRestoreAutoHoliday(
                              weeklySchedule[selectedDayIndex].date
                            )
                          }
                          className="flex items-center gap-2 md:gap-1.5 px-3 md:px-2 py-1.5 md:py-1 text-sm md:text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                          title="Restore auto holiday"
                        >
                          <Calendar className="w-4 h-4 md:w-3.5 md:h-3.5" />
                          <span>Restore Holiday</span>
                        </button>
                      )}
                    {/* Show mark holiday button for regular days */}
                    {!(
                      isSecondOrFourthSaturday(
                        weeklySchedule[selectedDayIndex].date
                      ) || isWeekend(weeklySchedule[selectedDayIndex].date)
                    ) && (
                      <button
                        onClick={() =>
                          handleMarkAsHoliday(
                            weeklySchedule[selectedDayIndex].date
                          )
                        }
                        className="flex items-center gap-2 md:gap-1.5 px-3 md:px-2 py-1.5 md:py-1 text-sm md:text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Mark as custom holiday"
                      >
                        <Calendar className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        <span>Mark Holiday</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {weeklySchedule[selectedDayIndex].schedule.classes.length === 0 ? (
              <div className="text-center py-8 md:py-6">
                <p className="text-gray-500 italic text-base md:text-sm">
                  {weeklySchedule[selectedDayIndex].schedule.isHoliday
                    ? "🎉 No classes - Holiday"
                    : "📅 No classes scheduled"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-2">
                {weeklySchedule[selectedDayIndex].schedule.classes.map(
                  (classSession) => (
                    <div
                      key={classSession.id}
                      className="flex items-center justify-between p-4 md:p-3 bg-gray-50/50 hover:bg-gray-50 rounded-lg md:rounded-md border transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 md:gap-2">
                          <div
                            className={`w-2 h-2 md:w-1.5 md:h-1.5 rounded-full ${
                              classSession.attended
                                ? "bg-green-400"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span className="font-semibold text-gray-900 text-base md:text-sm">
                            {classSession.subjectName}
                          </span>
                          <span className="text-sm md:text-xs text-gray-500 bg-white px-2 md:px-1.5 py-1 md:py-0.5 rounded-md md:rounded-sm">
                            Slot {classSession.slotNumber}
                          </span>
                          <span className="badge-info text-sm md:text-xs px-2 md:px-1.5 py-1 md:py-0.5">
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
                        className={`attendance-toggle-btn flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-lg md:rounded-md border-2 transition-all duration-200 ${
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
                          <Check className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        ) : (
                          <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        )}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {weeklySchedule[selectedDayIndex].schedule.classes.length > 0 && (
              <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-xs">
                    Attended:{" "}
                    {
                      weeklySchedule[selectedDayIndex].schedule.classes.filter(
                        (c) => c.attended
                      ).length
                    }{" "}
                    / {weeklySchedule[selectedDayIndex].schedule.classes.length}
                  </span>
                  <span
                    className={`font-bold text-lg md:text-base ${
                      weeklySchedule[selectedDayIndex].schedule.classes.filter(
                        (c) => c.attended
                      ).length ===
                      weeklySchedule[selectedDayIndex].schedule.classes.length
                        ? "text-green-600"
                        : weeklySchedule[
                            selectedDayIndex
                          ].schedule.classes.filter((c) => c.attended).length >
                          0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {weeklySchedule[selectedDayIndex].schedule.classes.length >
                    0
                      ? Math.round(
                          (weeklySchedule[
                            selectedDayIndex
                          ].schedule.classes.filter((c) => c.attended).length /
                            weeklySchedule[selectedDayIndex].schedule.classes
                              .length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Mark as Custom Holiday
            </h3>

            <div className="space-y-3 md:space-y-4">
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
                  className="input-field text-sm md:text-base"
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
                  className="input-field resize-none h-16 md:h-20 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="btn-secondary flex-1 text-sm md:text-base py-2 md:py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHoliday}
                disabled={!holidayName.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-2 md:py-3"
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
