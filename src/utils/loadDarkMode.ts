import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export const loadDarkMode = async (initialize: (isDark: boolean) => void): Promise<void> => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists() && typeof userSnap.data().darkMode === "boolean") {
        initialize(userSnap.data().darkMode);
      } else {
        initialize(false);
      }
    } catch (error) {
      console.error("Error loading darkMode from Firestore", error);
      initialize(false);
    }
  } else {
    const storedDark = localStorage.getItem('darkMode');
    if (storedDark !== null) {
      initialize(storedDark === 'true');
    } else {
      initialize(prefersDark.matches);
    }
  }
};
