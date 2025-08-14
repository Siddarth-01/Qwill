// Alternative auth method if popups don't work
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

// In AuthContext.tsx, you can replace signInWithPopup with:
const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// And handle the redirect result in useEffect:
useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        console.log("Redirect sign-in successful:", result);
      }
    })
    .catch((error) => {
      console.error("Redirect sign-in error:", error);
    });
}, []);
