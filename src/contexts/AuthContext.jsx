import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, waitForAppCheck } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appCheckReady, setAppCheckReady] = useState(false);
  const [error, setError] = useState(null);

  // Wait for App Check to be ready
  useEffect(() => {
    waitForAppCheck().then(() => {
      setAppCheckReady(true);
    });
  }, []);

  // Automatically sign in anonymously if not signed in
  // Wait for both App Check and then authenticate
  useEffect(() => {
    if (!appCheckReady) {
      return; // Wait for App Check first
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        // No user signed in, sign in anonymously
        try {
          await signInAnonymously(auth);
          // onAuthStateChanged will fire again with the new user
        } catch (err) {
          console.error('Error signing in anonymously:', err);
          setError(err.message);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [appCheckReady]);

  // Function to link anonymous account with email/password
  const linkAccount = async (email, password) => {
    try {
      if (!currentUser) {
        throw new Error('No user signed in');
      }

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(currentUser, credential);
      // onAuthStateChanged will fire with updated user
      return { success: true };
    } catch (err) {
      console.error('Error linking account:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    currentUser,
    loading: loading || !appCheckReady,
    error,
    linkAccount,
    appCheckReady,
  };

  return (
    <AuthContext.Provider value={value}>
      {(loading || !appCheckReady) ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}

