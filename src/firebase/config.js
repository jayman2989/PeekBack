// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMFLL3FJ35APs4VRqk1qvzD9Y-JzE1yPs",
  authDomain: "peekback-24faa.firebaseapp.com",
  projectId: "peekback-24faa",
  storageBucket: "peekback-24faa.firebasestorage.app",
  messagingSenderId: "29094431168",
  appId: "1:29094431168:web:d4886d3f7487e34ea7e025",
  measurementId: "G-FL3XYHSLV9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check initialization state
let appCheckReady = false;
let appCheckReadyCallbacks = [];

const notifyAppCheckReady = () => {
  appCheckReady = true;
  appCheckReadyCallbacks.forEach(callback => callback());
  appCheckReadyCallbacks = [];
};

export const waitForAppCheck = () => {
  return new Promise((resolve) => {
    if (appCheckReady) {
      resolve();
    } else {
      appCheckReadyCallbacks.push(resolve);
    }
  });
};

// Initialize App Check with reCAPTCHA v3 (only in browser environment)
// Wait for reCAPTCHA to be loaded before initializing
if (typeof window !== 'undefined') {
  const initAppCheck = () => {
    try {
      // Wait for reCAPTCHA to be available
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        // Use grecaptcha.ready callback to ensure reCAPTCHA is fully loaded
        window.grecaptcha.ready(() => {
          try {
            initializeAppCheck(app, {
              provider: new ReCaptchaV3Provider('6LffdiYsAAAAABTYCy9a_zsRj-XK7K_P8C-S48Ww'),
              isTokenAutoRefreshEnabled: true
            });
            
            if (process.env.NODE_ENV === 'development') {
              self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            }
            
            // Mark App Check as ready after a short delay to ensure token is generated
            setTimeout(() => {
              notifyAppCheckReady();
            }, 500);
          } catch (error) {
            console.warn('App Check initialization error:', error);
            // Still mark as ready to prevent blocking (App Check might work anyway)
            notifyAppCheckReady();
          }
        });
      } else if (window.grecaptcha) {
        // reCAPTCHA loaded but ready function not available, try direct initialization
        try {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider('6LffdiYsAAAAABTYCy9a_zsRj-XK7K_P8C-S48Ww'),
            isTokenAutoRefreshEnabled: true
          });
          
          if (process.env.NODE_ENV === 'development') {
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
          }
          
          setTimeout(() => {
            notifyAppCheckReady();
          }, 500);
        } catch (error) {
          console.warn('App Check initialization error:', error);
          notifyAppCheckReady();
        }
      } else {
        // reCAPTCHA not loaded yet, wait and retry (max 20 attempts = 2 seconds)
        if (typeof initAppCheck.retryCount === 'undefined') {
          initAppCheck.retryCount = 0;
        }
        if (initAppCheck.retryCount < 20) {
          initAppCheck.retryCount++;
          setTimeout(initAppCheck, 100);
        } else {
          console.warn('App Check: reCAPTCHA failed to load after multiple attempts');
          // Mark as ready anyway to prevent blocking (might work without App Check)
          notifyAppCheckReady();
        }
      }
    } catch (error) {
      console.warn('App Check initialization failed:', error);
      // Mark as ready to prevent blocking
      notifyAppCheckReady();
    }
  };

  // Start initialization after a short delay to ensure reCAPTCHA script has loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAppCheck, 500);
    });
  } else {
    setTimeout(initAppCheck, 500);
  }
} else {
  // Not in browser, mark as ready immediately
  appCheckReady = true;
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Export the app instance for advanced use cases
export default app;

