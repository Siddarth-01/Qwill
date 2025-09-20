import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

// Login component for Google authentication
const Login: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-ash">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-dark-text mb-6">
                <span className="text-gradient">Twill</span>
              </h1>
              

              <div className="space-y-6">
                


                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">
                      Smart Planning
                    </h3>
                    <p className="text-gray-600 dark:text-dark-muted">
                      Know exactly how many classes you can skip
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-white dark:bg-dark-ash rounded-2xl p-8 shadow-xl dark:shadow-2xl border dark:border-dark-border">
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <h1 className="text-4xl font-bold text-gradient mb-2">
                    Twill
                  </h1>
                  <p className="text-gray-600 dark:text-dark-muted">Student Attendance Tracker</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-dark-muted">
                  Sign in to continue tracking your attendance
                </p>
              </div>

              <div className="space-y-6">
                

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="
                    w-full text-lg py-4 px-6 rounded-xl
                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700
                    text-white font-semibold
                    shadow-lg hover:shadow-xl dark:shadow-lg dark:hover:shadow-xl
                    transform hover:-translate-y-0.5 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                    flex items-center justify-center gap-3
                  "
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Signing in...
                    </>
                  ) : (
                    "Continue with Google"
                  )}
                </button>
              </div>

            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
