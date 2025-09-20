import React, { useMemo } from "react";
import { Calendar, User, LogOut, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSemester } from "../contexts/SemesterContext";
import {
  calculateAttendanceStats,
  formatPercentage,
} from "../utils/attendanceUtils";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceTable from "./AttendanceTable";
import PlanSkipsTable from "./PlanSkipsTable";
import TwillLogo from "./TwillLogo";
import DarkModeToggle from "./DarkModeToggle";

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { semester, schedule } = useSemester();

  const allClasses = useMemo(() => {
    return schedule.flatMap((day) => day.classes.filter((cls) => cls.canEdit));
  }, [schedule]);

  const overallStats = useMemo(() => {
    // Calculate actual stats from current attendance data
    const classesToDate = allClasses; // All classes that can be edited (up to today)
    const attendedClasses = classesToDate.filter((cls) => cls.attended);

    const attendedUnits = attendedClasses.reduce(
      (sum, cls) => sum + cls.duration,
      0
    );
    const totalUnitsToDate = classesToDate.reduce(
      (sum, cls) => sum + cls.duration,
      0
    );

    // Calculate total semester units (all classes from start to end)
    const allSemesterClasses = schedule.flatMap((day) => day.classes);
    const totalSemesterUnits = allSemesterClasses.reduce(
      (sum, cls) => sum + cls.duration,
      0
    );

    // Calculate planned skips for future classes
    const futureClasses = allSemesterClasses.filter((cls) => !cls.canEdit);
    const plannedSkipUnits = futureClasses
      .filter((cls) => cls.plannedSkip)
      .reduce((sum, cls) => sum + cls.duration, 0);

    const percentage =
      totalUnitsToDate > 0 ? (attendedUnits / totalUnitsToDate) * 100 : 0;
    const requiredUnits = Math.ceil((totalSemesterUnits * 75) / 100); // Based on full semester

    // Calculate remaining units that can be skipped, considering planned skips
    const plannedAttendUnits = futureClasses
      .filter((cls) => !cls.plannedSkip)
      .reduce((sum, cls) => sum + cls.duration, 0); // Future classes not marked to skip

    const projectedTotalAttended = attendedUnits + plannedAttendUnits;
    const unitsCanSkip = Math.max(0, projectedTotalAttended - requiredUnits);

    return {
      totalUnits: totalUnitsToDate,
      attendedUnits,
      percentage,
      requiredUnits,
      totalSemesterUnits,
      unitsCanSkip,
      plannedSkipUnits,
    };
  }, [schedule, allClasses]);

  const subjectStats = useMemo(() => {
    if (!semester) return [];

    return semester.subjects.map((subject) => {
      const subjectClasses = allClasses.filter(
        (cls) => cls.subjectId === subject.id
      );
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        stats: calculateAttendanceStats(subjectClasses),
      };
    });
  }, [allClasses, semester]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (!semester) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-bg dark:to-dark-surface">
      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-ash/80 backdrop-blur-lg shadow-elegant border-b border-white/20 dark:border-dark-border/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                  <TwillLogo />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gradient">
                    Twill
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-dark-muted">
                    Attendance Tracker
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <DarkModeToggle />
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-blue-100 dark:ring-blue-800"
                />
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                  {user?.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 md:p-2 text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg md:rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white dark:bg-dark-ash rounded-2xl p-3 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border hover:shadow-xl dark:hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-dark-muted mb-1">
                  Overall
                </p>
                <p
                  className={`text-xl md:text-3xl font-bold ${
                    overallStats.percentage >= 75
                      ? "text-green-600 dark:text-green-400"
                      : overallStats.percentage >= 60
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatPercentage(overallStats.percentage)}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  {overallStats.attendedUnits} of {overallStats.totalUnits}
                </p>
              </div>
              <div
                className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${
                  overallStats.percentage >= 75
                    ? "bg-green-100 dark:bg-green-900/30"
                    : overallStats.percentage >= 60
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    overallStats.percentage >= 75
                      ? "text-green-600 dark:text-green-400"
                      : overallStats.percentage >= 60
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-ash rounded-2xl p-3 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border hover:shadow-xl dark:hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-dark-muted mb-1">
                  Attended
                </p>
                <p className="text-xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {overallStats.attendedUnits}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  of {overallStats.totalUnits}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 md:p-3 rounded-xl md:rounded-2xl">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-ash rounded-2xl p-3 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border hover:shadow-xl dark:hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-dark-muted mb-1">
                  Required
                </p>
                <p className="text-xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {overallStats.requiredUnits}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">for 75%</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 md:p-3 rounded-xl md:rounded-2xl">
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-ash rounded-2xl p-3 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border hover:shadow-xl dark:hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-dark-muted mb-1">
                  Can Skip
                </p>
                <p className="text-xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {overallStats.unitsCanSkip}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  more units
                  {overallStats.plannedSkipUnits > 0 && (
                    <span className="block text-orange-500 dark:text-orange-400">
                      ({overallStats.plannedSkipUnits} planned)
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-xl md:rounded-2xl">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Table */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white dark:bg-dark-ash rounded-2xl p-4 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border">
            <div className="pb-3 md:pb-4 mb-4 md:mb-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-dark-text">
                Attendance Calendar
              </h2>
              <p className="text-gray-600 dark:text-dark-muted mt-1 text-sm md:text-base">
                Visual overview of your attendance pattern
              </p>
            </div>
            <AttendanceCalendar />
          </div>

          <div className="bg-white dark:bg-dark-ash rounded-2xl p-4 md:p-4 shadow-lg dark:shadow-2xl border dark:border-dark-border">
            <div className="pb-3 md:pb-3 mb-4 md:mb-4 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-dark-text">
                Subject-wise Attendance
              </h2>
              <p className="text-gray-600 dark:text-dark-muted mt-1 text-sm md:text-sm">
                Track your progress across all subjects
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    <th className="text-left py-3 md:py-2 px-3 md:px-4 font-semibold text-gray-700 dark:text-dark-text bg-gray-50 dark:bg-dark-surface rounded-tl-lg text-sm md:text-sm">
                      Subject
                    </th>
                    <th className="text-center py-3 md:py-2 px-3 md:px-4 font-semibold text-gray-700 dark:text-dark-text bg-gray-50 dark:bg-dark-surface text-sm md:text-sm">
                      Attendance
                    </th>
                    <th className="text-center py-3 md:py-2 px-3 md:px-4 font-semibold text-gray-700 dark:text-dark-text bg-gray-50 dark:bg-dark-surface rounded-tr-lg text-sm md:text-sm">
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {subjectStats.map((subject) => (
                    <tr
                      key={subject.subjectId}
                      className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition-colors duration-200"
                    >
                      <td className="py-3 md:py-2 px-3 md:px-4">
                        <div className="flex items-center gap-2 md:gap-2">
                          <div
                            className={`w-2 h-2 md:w-2 md:h-2 rounded-full ${
                              subject.stats.percentage >= 75
                                ? "bg-green-400"
                                : subject.stats.percentage >= 60
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <span className="font-semibold text-gray-900 dark:text-dark-text text-sm md:text-sm">
                            {subject.subjectName}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 md:py-2 px-3 md:px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-base md:text-base font-bold ${
                              subject.stats.percentage >= 75
                                ? "text-green-600 dark:text-green-400"
                                : subject.stats.percentage >= 60
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatPercentage(subject.stats.percentage)}
                          </span>
                          <div className="w-12 md:w-12 bg-gray-200 dark:bg-dark-surface rounded-full h-1.5 md:h-1.5">
                            <div
                              className={`h-1.5 md:h-1.5 rounded-full transition-all duration-300 ${
                                subject.stats.percentage >= 75
                                  ? "bg-green-400"
                                  : subject.stats.percentage >= 60
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  subject.stats.percentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 md:py-2 px-3 md:px-4">
                        <div className="text-sm md:text-sm">
                          <span className="font-semibold text-gray-900 dark:text-dark-text">
                            {subject.stats.attendedUnits}
                          </span>
                          <span className="text-gray-500 dark:text-dark-muted">
                            {" "}
                            / {subject.stats.totalUnits}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Weekly Schedule and Plan to Skip Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white dark:bg-dark-ash rounded-2xl p-4 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border">
            <div className="pb-3 md:pb-4 mb-4 md:mb-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-dark-text">
                Weekly Schedule
              </h2>
              <p className="text-gray-600 dark:text-dark-muted mt-1 text-sm md:text-base">
                Mark your daily attendance
              </p>
            </div>
            <AttendanceTable />
          </div>

          {/* Plan to Skip Section */}
          <div className="bg-white dark:bg-dark-ash rounded-2xl p-4 md:p-6 shadow-lg dark:shadow-2xl border dark:border-dark-border">
            <div className="pb-3 md:pb-4 mb-4 md:mb-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-dark-text">
                Plan to Skip
              </h2>
              <p className="text-gray-600 dark:text-dark-muted mt-1 text-sm md:text-base">
                Mark future classes you're planning to skip
              </p>
            </div>
            <PlanSkipsTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
