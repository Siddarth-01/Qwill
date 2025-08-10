# Twill - Student Attendance Tracking System

## Project Overview

A React-based web application for tracking student attendance with Firebase authentication and database integration.

## Features

- Google authentication with Firebase
- Semester setup with start/end dates
- Class timetable management
- Daily attendance tracking
- Holiday management (Sundays, 2nd & 4th Saturdays, custom holidays)
- Attendance calculation and statistics
- Future attendance prediction
- Calendar visualization
- Subject-wise attendance tracking

## Technology Stack

- Frontend: React with TypeScript (Vite)
- Authentication & Database: Firebase
- Styling: Tailwind CSS
- Calendar: React Calendar component
- Icons: Lucide React

## Completed Steps

- [x] Project requirements clarified
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Project Structure

```
src/
├── components/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── SemesterSetup.tsx
│   ├── AttendanceCalendar.tsx
│   └── AttendanceTable.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── SemesterContext.tsx
├── config/
│   └── firebase.ts
├── types/
│   └── index.ts
├── utils/
│   └── attendanceUtils.ts
└── App.tsx
```

The project is ready for development. Next steps:

1. Configure Firebase with your project credentials
2. Set up Firestore security rules
3. Start development server with `npm run dev`
