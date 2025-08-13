import React, { useState } from "react";
import { Plus, Trash2, Calendar, Save } from "lucide-react";
import { useSemester } from "../contexts/SemesterContext";
import type { Subject, TimeSlot } from "../types";

const predefinedSubjects = [
  {
    name: "DAA",
    slots: [
      // Remove 4 classes to get from 16 to 12 (remove all of first week)
      { day: "TUE", slotNumbers: [3], duration: 1 },
      { day: "FRI", slotNumbers: [3], duration: 1 },
      { day: "SAT", slotNumbers: [4], duration: 1 },
    ],
  },
  {
    name: "OOPJ",
    slots: [
      // Remove 3 classes to get from 16 to 13 (remove 3 from first week)
      { day: "MON", slotNumbers: [4], duration: 1 },
      { day: "FRI", slotNumbers: [4], duration: 1 },
      { day: "SAT", slotNumbers: [1], duration: 1 },
    ],
  },
  {
    name: "DBMS",
    slots: [
      // Remove 2 classes to get from 16 to 14 (remove 2 from first week)
      { day: "MON", slotNumbers: [1], duration: 1 },
      { day: "WED", slotNumbers: [5], duration: 1 },
      { day: "THU", slotNumbers: [4], duration: 1 },
      { day: "FRI", slotNumbers: [2], duration: 1 },
    ],
  },
  {
    name: "MFCS",
    slots: [
      // Remove 1 class to get from 16 to 15 (remove 1 from first week)
      { day: "MON", slotNumbers: [2], duration: 1 },
      { day: "WED", slotNumbers: [4], duration: 1 },
      { day: "WED", slotNumbers: [6], duration: 1 },
      { day: "FRI", slotNumbers: [1], duration: 1 },
    ],
  },
  {
    name: "EEA",
    slots: [
      // Remove 1 class to get from 12 to 11 (remove 1 from first week)
      { day: "TUE", slotNumbers: [1], duration: 1 },
      { day: "THU", slotNumbers: [5], duration: 1 },
    ],
  },
  { name: "ES", slots: [{ day: "SAT", slotNumbers: [2, 3], duration: 2 }] },
  { name: "FP", slots: [{ day: "MON", slotNumbers: [5, 6], duration: 2 }] },
  {
    name: "PP LAB",
    slots: [{ day: "TUE", slotNumbers: [4, 5, 6], duration: 3 }],
  },
  {
    name: "DBMS LAB",
    slots: [{ day: "WED", slotNumbers: [1, 2, 3], duration: 3 }],
  },
  {
    name: "OOPJ LAB",
    slots: [{ day: "THU", slotNumbers: [1, 2, 3], duration: 3 }],
  },
];

const SemesterSetup: React.FC = () => {
  const { createSemester } = useSemester();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>(
    predefinedSubjects.map((subject, index) => ({
      id: `subject-${index}`,
      name: subject.name,
      slots: subject.slots as TimeSlot[],
    }))
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      await createSemester({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        subjects,
        holidays: [],
        customHolidays: [],
      });
    } catch (error) {
      console.error("Failed to create semester:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: "",
      slots: [],
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof Subject, value: any) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const addTimeSlot = (subjectIndex: number) => {
    const newSlot: TimeSlot = {
      day: "MON",
      slotNumbers: [1],
      duration: 1,
    };
    const updated = [...subjects];
    updated[subjectIndex].slots.push(newSlot);
    setSubjects(updated);
  };

  const removeTimeSlot = (subjectIndex: number, slotIndex: number) => {
    const updated = [...subjects];
    updated[subjectIndex].slots.splice(slotIndex, 1);
    setSubjects(updated);
  };

  const updateTimeSlot = (
    subjectIndex: number,
    slotIndex: number,
    field: keyof TimeSlot,
    value: any
  ) => {
    const updated = [...subjects];
    updated[subjectIndex].slots[slotIndex] = {
      ...updated[subjectIndex].slots[slotIndex],
      [field]: value,
    };
    setSubjects(updated);
  };

  const formatSlotNumbers = (slotNumbers: number[]) => {
    return slotNumbers.join(",");
  };

  const parseSlotNumbers = (value: string): number[] => {
    return value
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="card shadow-elegant-lg">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                Setup Your Semester
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Configure your semester dates and class timetable to start
              tracking
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Semester Dates */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                Semester Duration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Subjects & Timetable
                </h2>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>

              <div className="space-y-6">
                {subjects.map((subject, subjectIndex) => (
                  <div key={subject.id} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject Name
                        </label>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) =>
                            updateSubject(subjectIndex, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., DAA, OOPJ"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubject(subjectIndex)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">
                          Time Slots
                        </label>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(subjectIndex)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Slot
                        </button>
                      </div>

                      {subject.slots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-3 bg-white p-3 rounded-md"
                        >
                          <select
                            value={slot.day}
                            onChange={(e) =>
                              updateTimeSlot(
                                subjectIndex,
                                slotIndex,
                                "day",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="MON">Monday</option>
                            <option value="TUE">Tuesday</option>
                            <option value="WED">Wednesday</option>
                            <option value="THU">Thursday</option>
                            <option value="FRI">Friday</option>
                            <option value="SAT">Saturday</option>
                          </select>

                          <input
                            type="text"
                            value={formatSlotNumbers(slot.slotNumbers)}
                            onChange={(e) =>
                              updateTimeSlot(
                                subjectIndex,
                                slotIndex,
                                "slotNumbers",
                                parseSlotNumbers(e.target.value)
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Slot numbers (e.g., 1,2,3)"
                          />

                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={slot.duration}
                            onChange={(e) =>
                              updateTimeSlot(
                                subjectIndex,
                                slotIndex,
                                "duration",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Hours"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeTimeSlot(subjectIndex, slotIndex)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading || !startDate || !endDate}
                className="btn-primary text-lg px-12 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Save className="w-6 h-6" />
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Semester...
                  </>
                ) : (
                  "Create Semester & Start Tracking"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SemesterSetup;
