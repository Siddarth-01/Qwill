import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react";
import { useSemester } from "../contexts/SemesterContext";
import { formatDate } from "../utils/attendanceUtils";

const PlanSkipsTable: React.FC = () => {
  const { schedule, updatePlannedSkip, updateMultiplePlannedSkips } =
    useSemester();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

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

      // Only include future dates
      const dayDate = new Date(date);
      dayDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (dayDate >= todayDate) {
        const daySchedule = futureSchedule.find(
          (day) => day.date.toDateString() === date.toDateString()
        );

        if (daySchedule) {
          weekDays.push({
            date,
            schedule: daySchedule,
          });
        }
      }
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
    <div className="space-y-6">
      {/* Week Navigation - Always Available */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
        <button
          onClick={goToPreviousWeek}
          className="p-3 text-orange-600 hover:text-orange-700 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-gray-900 text-lg">
            {(() => {
              const today = new Date();
              const startOfWeek = new Date(today);
              startOfWeek.setDate(
                today.getDate() - today.getDay() + currentWeekOffset * 7
              );
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);

              return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
            })()}
          </h3>
          {currentWeekOffset !== 0 && (
            <button
              onClick={goToCurrentWeek}
              className="text-sm text-orange-600 hover:text-orange-700 mt-1 px-3 py-1 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              Go to current week
            </button>
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-3 text-orange-600 hover:text-orange-700 hover:bg-white rounded-xl transition-all duration-200 shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      {weeklySchedule.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            No future classes in this week
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Classes are either holidays, past, or not scheduled
          </p>
        </div>
      ) : (
        <>
          {/* Skip Impact Summary */}
          {getTotalPlannedSkips() > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Skip Impact</h4>
              </div>
              <p className="text-yellow-700 text-sm">
                You're planning to skip{" "}
                <strong>{getTotalPlannedSkips()}</strong> out of{" "}
                <strong>{getTotalFutureClasses()}</strong> future classes
              </p>
            </div>
          )}

          {/* Daily Schedule */}
          <div className="space-y-4 max-h-[32rem] overflow-y-auto custom-scrollbar">
            {weeklySchedule.map(({ date, schedule: daySchedule }) => (
              <div
                key={date.toDateString()}
                className="rounded-xl p-5 border-2 bg-white border-gray-100 hover:border-orange-200 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        daySchedule.classes.length > 0
                          ? daySchedule.classes.filter((c) => c.plannedSkip)
                              .length === 0
                            ? "bg-green-400"
                            : daySchedule.classes.filter((c) => c.plannedSkip)
                                .length === daySchedule.classes.length
                            ? "bg-red-400"
                            : "bg-yellow-400"
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
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {daySchedule.classes.length} class
                      {daySchedule.classes.length !== 1 ? "es" : ""}
                    </span>
                    {daySchedule.classes.length > 0 && (
                      <button
                        onClick={() => handleSelectAllDay(daySchedule)}
                        className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
                        title={
                          daySchedule.classes.every((c: any) => c.plannedSkip)
                            ? "Unselect all classes"
                            : "Skip all classes"
                        }
                      >
                        {daySchedule.classes.every(
                          (c: any) => c.plannedSkip
                        ) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {daySchedule.classes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 italic text-sm">
                      📅 No classes scheduled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySchedule.classes.map((classSession) => (
                      <div
                        key={classSession.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                          classSession.plannedSkip
                            ? "bg-red-50/50 hover:bg-red-50 border-red-200"
                            : "bg-gray-50/50 hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                classSession.plannedSkip
                                  ? "bg-red-400"
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
                            handleSkipToggle(
                              classSession.id,
                              classSession.plannedSkip || false
                            )
                          }
                          className={`flex items-center justify-center px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                            classSession.plannedSkip
                              ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                          } hover:border-red-400 cursor-pointer hover:scale-105 hover:shadow-md`}
                        >
                          {classSession.plannedSkip ? "Will Skip" : "Skip"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {daySchedule.classes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Planning to skip:{" "}
                        {
                          daySchedule.classes.filter((c) => c.plannedSkip)
                            .length
                        }{" "}
                        / {daySchedule.classes.length}
                      </span>
                      <span
                        className={`font-medium ${
                          daySchedule.classes.filter((c) => c.plannedSkip)
                            .length === 0
                            ? "text-green-600"
                            : daySchedule.classes.filter((c) => c.plannedSkip)
                                .length === daySchedule.classes.length
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {daySchedule.classes.length > 0
                          ? Math.round(
                              (daySchedule.classes.filter((c) => c.plannedSkip)
                                .length /
                                daySchedule.classes.length) *
                                100
                            )
                          : 0}
                        % skip rate
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlanSkipsTable;
