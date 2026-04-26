import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

export interface UserSession {
  sessionId: string;
  startTime: any;
  lastActive: any;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
}

/**
 * Logs a new session for an authenticated user.
 */
export async function logUserSession(db: Firestore, uid: string) {
  if (typeof window === 'undefined') return;

  const sessionId = Math.random().toString(36).substring(2, 15);
  const sessionRef = doc(db, 'users', uid, 'sessions', sessionId);

  const sessionData: UserSession = {
    sessionId,
    startTime: serverTimestamp(),
    lastActive: serverTimestamp(),
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform || 'unknown',
      language: navigator.language,
    },
  };

  try {
    await setDoc(sessionRef, sessionData);
    
    // Periodically update lastActive
    const interval = setInterval(async () => {
      try {
        await updateDoc(sessionRef, {
          lastActive: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to update session activity", e);
        clearInterval(interval);
      }
    }, 60000); // Every minute

    // Cleanup on window close
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
    });

    return sessionId;
  } catch (error) {
    console.error("Error logging session:", error);
  }
}
