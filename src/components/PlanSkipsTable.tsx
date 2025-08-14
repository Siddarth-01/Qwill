import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react";
import { useSemester } from "../contexts/SemesterContext";
import { formatDate } from "../utils/attendanceUtils";

const PlanSkipsTable: React.FC = () => {
  const { schedule, updatePlannedSkip, updateMultiplePlannedSkips } =
    useSemester();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Track which day of the week is selected

  // Get future schedule only
  const futureSchedule = useMemo(() => {
    const now = new Date(); // Current date and time, not just today

    const filtered = schedule.filter((day) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(23, 59, 59, 999); // End of that day
      return dayDate > now && !day.isHoliday; // Only future dates
    });

    console.log(`Future schedule has ${filtered.length} days`);
    console.log(
      `Total classes in future schedule: ${filtered.reduce(
        (total, day) => total + day.classes.length,
        0
      )}`
    );

    return filtered;
  }, [schedule]);

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

      // Check if this is a future date
      const dayDate = new Date(date);
      dayDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const isFutureDate = dayDate >= todayDate;

      const daySchedule = isFutureDate
        ? futureSchedule.find(
            (day) => day.date.toDateString() === date.toDateString()
          )
        : null;

      weekDays.push({
        date,
        schedule: daySchedule || { date, classes: [], isHoliday: false },
        isFutureDate,
      });
    }

    return weekDays;
  }, [futureSchedule, currentWeekOffset]);

  const handleSkipToggle = async (
    classId: string,
    currentPlannedSkip: boolean
  ) => {
    console.log("Skip toggle clicked:", {
      classId,
      currentPlannedSkip,
      newValue: !currentPlannedSkip,
    });
    try {
      await updatePlannedSkip(classId, !currentPlannedSkip);
    } catch (error) {
      console.error("Failed to update planned skip:", error);
    }
  };

  const handleSelectAllDay = async (daySchedule: any) => {
    const allSkipped = daySchedule.classes.every((c: any) => c.plannedSkip);
    const newSkipValue = !allSkipped;

    try {
      // Create a batch update object for all classes in this day
      const updates: Record<string, boolean> = {};
      daySchedule.classes.forEach((classSession: any) => {
        updates[classSession.id] = newSkipValue;
      });

      // Update all classes at once
      await updateMultiplePlannedSkips(updates);
    } catch (error) {
      console.error("Failed to update day skip status:", error);
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

  // Calculate potential impact
  const getTotalPlannedSkips = () => {
    return futureSchedule.reduce((total, day) => {
      return total + day.classes.filter((c) => c.plannedSkip).length;
    }, 0);
  };

  const getTotalFutureClasses = () => {
    const total = futureSchedule.reduce((total, day) => {
      return total + day.classes.length;
    }, 0);
    console.log(`Total future classes: ${total}`);
    return total;
  };

  return (
    <div className="space-y-4 md:space-y-4">
      {/* Week Navigation - Always Available */}
      <div className="flex items-center justify-between p-3 md:p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg md:rounded-lg border border-orange-100">
        <button
          onClick={goToPreviousWeek}
          className="p-2 md:p-1.5 text-orange-600 hover:text-orange-700 hover:bg-white rounded-lg md:rounded-lg transition-all duration-200 shadow-sm"
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
              className="text-xs md:text-xs text-orange-600 hover:text-orange-700 mt-1 px-2 md:px-2 py-1 bg-orange-50 hover:bg-orange-100 rounded-md md:rounded-md transition-colors"
            >
              Current week
            </button>
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 md:p-1.5 text-orange-600 hover:text-orange-700 hover:bg-white rounded-lg md:rounded-lg transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>
      </div>

      {/* Content Area */}
      {weeklySchedule.filter(
        (day) => day.isFutureDate && day.schedule.classes.length > 0
      ).length === 0 ? (
        <div className="text-center py-8 md:py-6">
          <Calendar className="w-8 h-8 md:w-8 md:h-8 text-gray-400 mx-auto mb-3 md:mb-2" />
          <p className="text-gray-500 text-base md:text-sm font-medium">
            No future classes in this week
          </p>
          <p className="text-gray-400 text-xs md:text-xs mt-1">
            Classes are either holidays, past, or not scheduled
          </p>
        </div>
      ) : (
        <>
          {/* Skip Impact Summary */}
          {getTotalPlannedSkips() > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg md:rounded-xl p-3 md:p-3">
              <p className="text-yellow-700 text-xs md:text-sm">
                You're planning to skip{" "}
                <strong>{getTotalPlannedSkips()}</strong> out of{" "}
                <strong>{getTotalFutureClasses()}</strong> future classes
              </p>
            </div>
          )}

          {/* Date Navigation Bar */}
          <div className="grid grid-cols-7 gap-1 md:gap-0.5 p-2 md:p-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg md:rounded-lg border border-orange-100">
            {weeklySchedule.map(
              ({ date, schedule: daySchedule, isFutureDate }, index) => {
                const isSelected = index === selectedDayIndex;
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const hasClasses = daySchedule.classes.length > 0;
                const skipRate =
                  hasClasses && isFutureDate
                    ? daySchedule.classes.filter((c) => c.plannedSkip).length /
                      daySchedule.classes.length
                    : 0;

                return (
                  <button
                    key={date.toDateString()}
                    onClick={() => setSelectedDayIndex(index)}
                    disabled={!isFutureDate}
                    className={`p-2 md:p-1.5 rounded-lg md:rounded-md text-center transition-all duration-200 ${
                      !isFutureDate
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : isSelected
                        ? "bg-orange-600 text-white shadow-lg scale-105"
                        : "bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="text-xs md:text-xs font-medium">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-xs md:text-xs font-bold">
                      {date.getDate()}
                    </div>
                    {/* Status indicator */}
                    {isFutureDate && (
                      <div
                        className={`w-1.5 h-1.5 md:w-1 md:h-1 rounded-full mx-auto mt-1 ${
                          !hasClasses
                            ? "bg-blue-300"
                            : skipRate === 0
                            ? isSelected
                              ? "bg-green-200"
                              : "bg-green-400"
                            : skipRate === 1
                            ? isSelected
                              ? "bg-red-200"
                              : "bg-red-400"
                            : isSelected
                            ? "bg-yellow-200"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                    )}
                    {isToday && (
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        Today
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Selected Day Schedule */}
          <div className="min-h-[20rem] md:min-h-[18rem]">
            {weeklySchedule[selectedDayIndex] && (
              <div className="rounded-lg md:rounded-md p-4 md:p-3 border-2 bg-white border-gray-100 hover:border-orange-200 transition-all duration-200">
                <div className="flex items-center justify-between mb-4 md:mb-3">
                  <div className="flex items-center gap-3 md:gap-2">
                    <div
                      className={`w-3 h-3 md:w-2.5 md:h-2.5 rounded-full ${
                        !weeklySchedule[selectedDayIndex].isFutureDate
                          ? "bg-gray-400"
                          : weeklySchedule[selectedDayIndex].schedule.classes
                              .length > 0
                          ? weeklySchedule[
                              selectedDayIndex
                            ].schedule.classes.filter((c) => c.plannedSkip)
                              .length === 0
                            ? "bg-green-400"
                            : weeklySchedule[
                                selectedDayIndex
                              ].schedule.classes.filter((c) => c.plannedSkip)
                                .length ===
                              weeklySchedule[selectedDayIndex].schedule.classes
                                .length
                            ? "bg-red-400"
                            : "bg-yellow-400"
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
                    {!weeklySchedule[selectedDayIndex].isFutureDate && (
                      <span className="text-sm md:text-xs text-gray-500 bg-gray-100 px-3 md:px-2 py-1.5 md:py-1 rounded-full font-medium">
                        Past Date
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:gap-1.5">
                    <Clock className="w-4 h-4 md:w-3.5 md:h-3.5 text-gray-400" />
                    <span className="text-sm md:text-xs text-gray-500">
                      {weeklySchedule[selectedDayIndex].schedule.classes.length}{" "}
                      class
                      {weeklySchedule[selectedDayIndex].schedule.classes
                        .length !== 1
                        ? "es"
                        : ""}
                    </span>
                    {weeklySchedule[selectedDayIndex].schedule.classes.length >
                      0 &&
                      weeklySchedule[selectedDayIndex].isFutureDate && (
                        <button
                          onClick={() =>
                            handleSelectAllDay(
                              weeklySchedule[selectedDayIndex].schedule
                            )
                          }
                          className="ml-1 md:ml-0.5 p-2 md:p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
                          title={
                            weeklySchedule[
                              selectedDayIndex
                            ].schedule.classes.every((c: any) => c.plannedSkip)
                              ? "Unselect all classes"
                              : "Skip all classes"
                          }
                        >
                          {weeklySchedule[
                            selectedDayIndex
                          ].schedule.classes.every(
                            (c: any) => c.plannedSkip
                          ) ? (
                            <CheckSquare className="w-5 h-5 md:w-4 md:h-4" />
                          ) : (
                            <Square className="w-5 h-5 md:w-4 md:h-4" />
                          )}
                        </button>
                      )}
                  </div>
                </div>

                {!weeklySchedule[selectedDayIndex].isFutureDate ? (
                  <div className="text-center py-8 md:py-6">
                    <p className="text-gray-500 italic text-base md:text-sm">
                      📅 Cannot plan skips for past dates
                    </p>
                  </div>
                ) : weeklySchedule[selectedDayIndex].schedule.classes.length ===
                  0 ? (
                  <div className="text-center py-8 md:py-6">
                    <p className="text-gray-500 italic text-base md:text-sm">
                      📅 No classes scheduled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-2">
                    {weeklySchedule[selectedDayIndex].schedule.classes.map(
                      (classSession) => (
                        <div
                          key={classSession.id}
                          className={`flex items-center justify-between p-4 md:p-3 rounded-lg md:rounded-md border transition-all duration-200 hover:shadow-sm ${
                            classSession.plannedSkip
                              ? "bg-red-50/50 hover:bg-red-50 border-red-200"
                              : "bg-gray-50/50 hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 md:gap-2">
                              <div
                                className={`w-2 h-2 md:w-1.5 md:h-1.5 rounded-full ${
                                  classSession.plannedSkip
                                    ? "bg-red-400"
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
                              handleSkipToggle(
                                classSession.id,
                                classSession.plannedSkip || false
                              )
                            }
                            className={`flex items-center justify-center px-4 md:px-3 py-2 md:py-1.5 rounded-lg md:rounded-md border-2 transition-all duration-200 text-sm md:text-xs font-medium ${
                              classSession.plannedSkip
                                ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                                : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                            } hover:border-red-400 cursor-pointer hover:scale-105 hover:shadow-md`}
                          >
                            {classSession.plannedSkip ? "Will Skip" : "Skip"}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {weeklySchedule[selectedDayIndex].schedule.classes.length > 0 &&
                  weeklySchedule[selectedDayIndex].isFutureDate && (
                    <div className="mt-4 md:mt-3 pt-4 md:pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm md:text-xs">
                          Planning to skip:{" "}
                          {
                            weeklySchedule[
                              selectedDayIndex
                            ].schedule.classes.filter((c) => c.plannedSkip)
                              .length
                          }{" "}
                          /{" "}
                          {
                            weeklySchedule[selectedDayIndex].schedule.classes
                              .length
                          }
                        </span>
                        <span
                          className={`font-bold text-lg md:text-base ${
                            weeklySchedule[
                              selectedDayIndex
                            ].schedule.classes.filter((c) => c.plannedSkip)
                              .length === 0
                              ? "text-green-600"
                              : weeklySchedule[
                                  selectedDayIndex
                                ].schedule.classes.filter((c) => c.plannedSkip)
                                  .length ===
                                weeklySchedule[selectedDayIndex].schedule
                                  .classes.length
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {weeklySchedule[selectedDayIndex].schedule.classes
                            .length > 0
                            ? Math.round(
                                (weeklySchedule[
                                  selectedDayIndex
                                ].schedule.classes.filter((c) => c.plannedSkip)
                                  .length /
                                  weeklySchedule[selectedDayIndex].schedule
                                    .classes.length) *
                                  100
                              )
                            : 0}
                          % skip rate
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PlanSkipsTable;
