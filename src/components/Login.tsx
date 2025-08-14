import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                <span className="text-gradient">Twill</span>
              </h1>
              

              <div className="space-y-6">
                


                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Smart Planning
                    </h3>
                    <p className="text-gray-600">
                      Know exactly how many classes you can skip
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <div className="card shadow-elegant-lg">
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <h1 className="text-4xl font-bold text-gradient mb-2">
                    Twill
                  </h1>
                  <p className="text-gray-600">Student Attendance Tracker</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue tracking your attendance
                </p>
              </div>

              <div className="space-y-6">
                

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="btn-primary w-full text-lg py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
