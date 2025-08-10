import React, { useMemo } from "react";
import {
  Calendar,
  User,
  LogOut,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSemester } from "../contexts/SemesterContext";
import {
  calculateAttendanceStats,
  formatPercentage,
} from "../utils/attendanceUtils";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceTable from "./AttendanceTable";
import PlanSkipsTable from "./PlanSkipsTable";

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { semester, schedule } = useSemester();

  const allClasses = useMemo(() => {
    return schedule.flatMap((day) => day.classes.filter((cls) => cls.canEdit));
  }, [schedule]);

  const overallStats = useMemo(() => {
    // Fixed current stats as of today (August 10, 2025)
    const attendedUnits = 108;
    const totalUnitsToDate = 113; // Classes until today

    // Calculate total semester units (all classes from July 14 to November 16)
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

    const percentage = (attendedUnits / totalUnitsToDate) * 100;
    const requiredUnits = Math.ceil((totalSemesterUnits * 75) / 100); // Based on full semester

    // Calculate remaining units that can be skipped, considering planned skips
    const effectiveAttendedUnits = attendedUnits; // Already attended classes
    const plannedAttendUnits = futureClasses
      .filter((cls) => !cls.plannedSkip)
      .reduce((sum, cls) => sum + cls.duration, 0); // Future classes not marked to skip

    const projectedTotalAttended = effectiveAttendedUnits + plannedAttendUnits;
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
  }, [schedule]);

  const subjectStats = useMemo(() => {
    if (!semester) return [];

    // Fixed target ratios as provided by user
    const targetRatios = {
      DAA: { attended: 12, total: 12 },
      OOPJ: { attended: 11, total: 13 },
      DBMS: { attended: 12, total: 14 },
      MFCS: { attended: 15, total: 15 },
      EEA: { attended: 10, total: 11 },
      ES: { attended: 4, total: 4 },
      FP: { attended: 8, total: 8 },
      "PP LAB": { attended: 12, total: 12 },
      "DBMS LAB": { attended: 12, total: 12 },
      "OOPJ LAB": { attended: 12, total: 12 },
    };

    return semester.subjects.map((subject) => {
      const target = targetRatios[subject.name as keyof typeof targetRatios];

      if (target) {
        // Use fixed ratios
        const percentage = (target.attended / target.total) * 100;
        const requiredUnits = Math.ceil((target.total * 75) / 100);
        const unitsCanSkip = Math.max(0, target.attended - requiredUnits);

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          stats: {
            totalUnits: target.total,
            attendedUnits: target.attended,
            percentage,
            requiredUnits,
            unitsCanSkip,
          },
        };
      } else {
        // Fallback to normal calculation for subjects not in the fixed list
        const subjectClasses = allClasses.filter(
          (cls) => cls.subjectId === subject.id
        );
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          stats: calculateAttendanceStats(subjectClasses),
        };
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-elegant border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Twill</h1>
                  <p className="text-sm text-gray-500">Attendance Tracker</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full ring-2 ring-blue-100"
                />
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card shadow-elegant hover:shadow-elegant-lg transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Overall Attendance
                </p>
                <p
                  className={`text-3xl font-bold ${
                    overallStats.percentage >= 75
                      ? "text-green-600"
                      : overallStats.percentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(overallStats.percentage)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallStats.attendedUnits} of {overallStats.totalUnits}{" "}
                  units
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  overallStats.percentage >= 75
                    ? "bg-green-100"
                    : overallStats.percentage >= 60
                    ? "bg-yellow-100"
                    : "bg-red-100"
                }`}
              >
                <TrendingUp
                  className={`w-8 h-8 ${
                    overallStats.percentage >= 75
                      ? "text-green-600"
                      : overallStats.percentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="card shadow-elegant hover:shadow-elegant-lg transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Classes Attended
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {overallStats.attendedUnits}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  out of {overallStats.totalUnits} total
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-2xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card shadow-elegant hover:shadow-elegant-lg transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Required for 75%
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {overallStats.requiredUnits}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  out of {overallStats.totalSemesterUnits} total units
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card shadow-elegant hover:shadow-elegant-lg transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Can Skip
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {overallStats.unitsCanSkip}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  more units to maintain 75%
                  {overallStats.plannedSkipUnits > 0 && (
                    <span className="block text-orange-500">
                      ({overallStats.plannedSkipUnits} already planned)
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-2xl">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Table */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="card shadow-elegant">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">
                Attendance Calendar
              </h2>
              <p className="text-gray-600 mt-1">
                Visual overview of your attendance pattern
              </p>
            </div>
            <AttendanceCalendar />
          </div>

          <div className="card shadow-elegant">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">
                Weekly Schedule
              </h2>
              <p className="text-gray-600 mt-1">Mark your daily attendance</p>
            </div>
            <AttendanceTable />
          </div>
        </div>

        {/* Subject-wise Stats and New Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="card shadow-elegant">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">
                Subject-wise Attendance
              </h2>
              <p className="text-gray-600 mt-1">
                Track your progress across all subjects
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50 rounded-tl-lg">
                      Subject
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                      Attendance
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50 rounded-tr-lg">
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjectStats.map((subject) => (
                    <tr
                      key={subject.subjectId}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              subject.stats.percentage >= 75
                                ? "bg-green-400"
                                : subject.stats.percentage >= 60
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <span className="font-semibold text-gray-900">
                            {subject.subjectName}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-lg font-bold ${
                              subject.stats.percentage >= 75
                                ? "text-green-600"
                                : subject.stats.percentage >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPercentage(subject.stats.percentage)}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
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
                      <td className="text-center py-4 px-6">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            {subject.stats.attendedUnits}
                          </span>
                          <span className="text-gray-500">
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

          {/* Plan to Skip Section */}
          <div className="card shadow-elegant">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900">Plan to Skip</h2>
              <p className="text-gray-600 mt-1">
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
