import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SemesterProvider, useSemester } from "./contexts/SemesterContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SemesterSetup from "./components/SemesterSetup";

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { semester, loading: semesterLoading } = useSemester();

  if (authLoading || semesterLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!semester) {
    return <SemesterSetup />;
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SemesterProvider>
          <AppContent />
        </SemesterProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
};

export default App;
