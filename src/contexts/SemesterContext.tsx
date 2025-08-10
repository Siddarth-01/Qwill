import React, { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import type { Semester, CustomHoliday, DaySchedule } from "../types";
import { generateScheduleForPeriod } from "../utils/attendanceUtils";

interface SemesterContextType {
  semester: Semester | null;
  schedule: DaySchedule[];
  loading: boolean;
  createSemester: (semesterData: Omit<Semester, "id">) => Promise<void>;
  updateAttendance: (classId: string, attended: boolean) => Promise<void>;
  updatePlannedSkip: (classId: string, plannedSkip: boolean) => Promise<void>;
  updateMultiplePlannedSkips: (
    updates: Record<string, boolean>
  ) => Promise<void>;
  addCustomHoliday: (holiday: Omit<CustomHoliday, "id">) => Promise<void>;
  removeCustomHoliday: (holidayId: string) => Promise<void>;
  refreshSchedule: () => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(
  undefined
);

export const useSemester = () => {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error("useSemester must be used within a SemesterProvider");
  }
  return context;
};

interface SemesterProviderProps {
  children: React.ReactNode;
}

export const SemesterProvider: React.FC<SemesterProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [semester, setSemester] = useState<Semester | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>(
    {}
  );
  const [plannedSkipsData, setPlannedSkipsData] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!user) {
      setSemester(null);
      setSchedule([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading when starting to fetch data

    const semesterDocRef = doc(db, "semesters", user.uid);
    const attendanceDocRef = doc(db, "attendance", user.uid);
    const plannedSkipsDocRef = doc(db, "plannedSkips", user.uid);

    const unsubscribeSemester = onSnapshot(semesterDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSemester({
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          subjects: data.subjects,
          holidays: data.holidays?.map((h: any) => h.toDate()) || [],
          customHolidays:
            data.customHolidays?.map((h: any) => ({
              ...h,
              date: h.date.toDate(),
            })) || [],
        });
      }
      setLoading(false);
    });

    const unsubscribeAttendance = onSnapshot(attendanceDocRef, (doc) => {
      if (doc.exists()) {
        setAttendanceData(doc.data().classes || {});
      }
    });

    const unsubscribePlannedSkips = onSnapshot(plannedSkipsDocRef, (doc) => {
      if (doc.exists()) {
        setPlannedSkipsData(doc.data().classes || {});
      }
    });

    return () => {
      unsubscribeSemester();
      unsubscribeAttendance();
      unsubscribePlannedSkips();
    };
  }, [user]);

  useEffect(() => {
    if (semester) {
      refreshSchedule();
    }
  }, [semester, attendanceData, plannedSkipsData]);

  const refreshSchedule = () => {
    if (!semester) return;

    const allHolidays = [
      ...semester.holidays,
      ...semester.customHolidays.map((h) => h.date),
    ];

    const generatedSchedule = generateScheduleForPeriod(
      semester.startDate,
      semester.endDate,
      semester.subjects,
      allHolidays
    );

    // Apply attendance data and planned skips
    const updatedSchedule = generatedSchedule.map((day) => ({
      ...day,
      classes: day.classes.map((cls) => ({
        ...cls,
        attended: attendanceData[cls.id] || false,
        plannedSkip: plannedSkipsData[cls.id] || false,
      })),
    }));

    setSchedule(updatedSchedule);
  };

  const createSemester = async (semesterData: Omit<Semester, "id">) => {
    if (!user) throw new Error("User not authenticated");

    const semesterDocRef = doc(db, "semesters", user.uid);
    await setDoc(semesterDocRef, {
      ...semesterData,
      startDate: semesterData.startDate,
      endDate: semesterData.endDate,
      holidays: semesterData.holidays,
      customHolidays: semesterData.customHolidays,
    });
  };

  const updateAttendance = async (classId: string, attended: boolean) => {
    if (!user) throw new Error("User not authenticated");

    const attendanceDocRef = doc(db, "attendance", user.uid);
    const newAttendanceData = { ...attendanceData, [classId]: attended };

    await setDoc(
      attendanceDocRef,
      { classes: newAttendanceData },
      { merge: true }
    );
  };

  const updatePlannedSkip = async (classId: string, plannedSkip: boolean) => {
    console.log("updatePlannedSkip called:", {
      classId,
      plannedSkip,
      user: !!user,
    });
    if (!user) throw new Error("User not authenticated");

    const plannedSkipsDocRef = doc(db, "plannedSkips", user.uid);
    const newPlannedSkipsData = { ...plannedSkipsData, [classId]: plannedSkip };

    console.log("Updating planned skips:", newPlannedSkipsData);
    await setDoc(
      plannedSkipsDocRef,
      { classes: newPlannedSkipsData },
      { merge: true }
    );
    console.log("Planned skip update completed");
  };

  const updateMultiplePlannedSkips = async (
    updates: Record<string, boolean>
  ) => {
    if (!user) throw new Error("User not authenticated");

    const plannedSkipsDocRef = doc(db, "plannedSkips", user.uid);
    const newPlannedSkipsData = { ...plannedSkipsData, ...updates };

    await setDoc(
      plannedSkipsDocRef,
      { classes: newPlannedSkipsData },
      { merge: true }
    );
  };

  const addCustomHoliday = async (holiday: Omit<CustomHoliday, "id">) => {
    if (!user || !semester)
      throw new Error("User not authenticated or no semester");

    const newHoliday = {
      id: Date.now().toString(),
      name: holiday.name,
      description: holiday.description || null, // Use null instead of undefined
      date: Timestamp.fromDate(holiday.date),
    };

    // Create a clean array for Firestore
    const currentHolidays = semester.customHolidays || [];
    const updatedHolidays = [...currentHolidays, newHoliday];

    const semesterDocRef = doc(db, "semesters", user.uid);
    await updateDoc(semesterDocRef, {
      customHolidays: updatedHolidays,
    });
  };

  const removeCustomHoliday = async (holidayId: string) => {
    if (!user || !semester)
      throw new Error("User not authenticated or no semester");

    const updatedHolidays = semester.customHolidays.filter(
      (h) => h.id !== holidayId
    );

    const semesterDocRef = doc(db, "semesters", user.uid);
    await updateDoc(semesterDocRef, { customHolidays: updatedHolidays });
  };

  const value = {
    semester,
    schedule,
    loading,
    createSemester,
    updateAttendance,
    updatePlannedSkip,
    updateMultiplePlannedSkips,
    addCustomHoliday,
    removeCustomHoliday,
    refreshSchedule,
  };

  return (
    <SemesterContext.Provider value={value}>
      {children}
    </SemesterContext.Provider>
  );
};
