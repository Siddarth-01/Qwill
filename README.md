# Twill - Student Attendance Tracker

A comprehensive web application for tracking college attendance with smart features to help maintain the mandatory 75% attendance requirement.

## Features

### Core Functionality

- **Semester Setup**: Define start/end dates and complete class timetable
- **Daily Attendance Tracking**: Mark attendance for individual classes or entire days
- **Smart Calculations**: Automatic calculation of attendance percentage and units that can be skipped
- **Holiday Management**: Built-in support for Sundays, 2nd & 4th Saturdays, plus custom holidays
- **Subject-wise Analytics**: Track attendance for each subject separately

### Advanced Features

- **Future Planning**: Predict attendance based on planned absences
- **Calendar Visualization**: Color-coded calendar showing attendance status
- **Real-time Updates**: Live sync across devices using Firebase
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### User Interface

- **Google Authentication**: Secure login with Firebase Auth
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Interactive Calendar**: Visual representation of attendance patterns
- **Dashboard Analytics**: Overview of overall and subject-wise attendance

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Firebase Firestore
- **Calendar**: React Calendar
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd twill-88
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Firebase Configuration**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google Sign-in provider
   - Enable Cloud Firestore database
   - Get your Firebase configuration from Project Settings
   - Update `src/config/firebase.ts` with your actual Firebase configuration:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id",
   };
   ```

4. **Firestore Security Rules**
   Add these security rules to your Firestore database:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /semesters/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /attendance/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:5173` in your browser

## Usage Guide

### Initial Setup

1. **Sign in** with your Google account
2. **Configure Semester**: Set start and end dates for your current semester
3. **Add Subjects**: The app comes pre-configured with the timetable you provided, but you can modify it
4. **Add Custom Holidays**: Mark any additional holidays or festivals

### Daily Usage

1. **Mark Attendance**: Use the daily attendance table to mark classes attended
2. **View Calendar**: Check the calendar for a visual overview of your attendance
3. **Monitor Statistics**: Keep track of your overall and subject-wise attendance percentages
4. **Plan Ahead**: Use the future planning feature to see how missing certain classes will affect your percentage

### Understanding the Interface

#### Dashboard

- **Overall Attendance**: Shows your current attendance percentage
- **Classes Attended**: Total units attended vs total units
- **Required for 75%**: Minimum units needed to maintain 75%
- **Can Skip**: Number of units you can afford to miss

#### Calendar Color Coding

- **Green**: Full attendance (100%)
- **Yellow**: Good attendance (75%+)
- **Orange**: Partial attendance
- **Red**: No attendance
- **Gray**: Holiday/No classes

#### Subject-wise Table

Shows detailed breakdown for each subject including attendance percentage and units that can be skipped.

## Pre-configured Timetable

The application comes with your provided timetable:

- **DAA**: MON[3], TUE[3], FRI[3], SAT[4]
- **OOPJ**: MON[4], TUE[2], FRI[4], SAT[1]
- **DBMS**: MON[1], WED[5], THU[4], FRI[2]
- **MFCS**: MON[2], WED[4], WED[6], FRI[1]
- **ES**: SAT[2,3] (2-hour session)
- **FP**: MON[5,6] (2-hour session)
- **PP LAB**: TUE[4,5,6] (3-hour lab)
- **DBMS LAB**: WED[1,2,3] (3-hour lab)
- **OOPJ LAB**: THU[1,2,3] (3-hour lab)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment Options

- **Vercel**: Connect your GitHub repository to Vercel for automatic deployments
- **Netlify**: Similar to Vercel, supports automatic deployments from Git
- **Firebase Hosting**: Use Firebase Hosting to deploy alongside your Firebase backend
- **GitHub Pages**: Deploy static files to GitHub Pages

## License

This project is licensed under the MIT License.
