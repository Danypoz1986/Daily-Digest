import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';



/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import Register from './pages/Register'
import Menu from './pages/Menu';
import ProtectedRoute from './utils/ProtectedRoute';
import PublicRoute from './utils/PublicRoute';
import NotFoundRoute from './utils/NotFoundRoute';
import { loadDarkMode } from './utils/loadDarkMode';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';


setupIonicReact();

const App: React.FC = () => {

  useEffect(() => {
    const applyDarkMode = (shouldEnable: boolean) => {
      const html = document.documentElement;
      const body = document.body;
  
      const backgroundColor = shouldEnable ? '#121212' : '#ffffff';
      const textColor = shouldEnable ? '#ffffff' : '#000000';
      const secondaryBackground = shouldEnable ? '#1e1e1e' : '#ffffff';
  
      html.classList.toggle('ion-palette-dark', shouldEnable);
      html.style.setProperty('--ion-background-color', backgroundColor, 'important');
      html.style.setProperty('--ion-text-color', textColor, 'important');
      html.style.setProperty('--ion-toolbar-background', secondaryBackground, 'important');
      html.style.setProperty('--ion-toolbar-color', textColor, 'important');
      html.style.setProperty('--ion-tab-bar-background', secondaryBackground, 'important');
      body.style.backgroundColor = backgroundColor;
  
      const menuList = document.querySelector('ion-menu ion-list') as HTMLElement | null;
      if (menuList) {
        menuList.style.setProperty('--background', secondaryBackground, 'important');
        menuList.style.setProperty('--color', textColor, 'important');
      }
    };
  
    const auth = getAuth();
    const db = getFirestore();
  
    // Always apply dark mode once when app loads
    loadDarkMode((isDark) => {
      applyDarkMode(isDark);
    });
  
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const darkMode = userDoc.data()?.darkMode ?? false;
          applyDarkMode(darkMode);
        } catch (error) {
          console.error("Failed to fetch user dark mode", error);
          applyDarkMode(false);
        }
      } else {
        applyDarkMode(false); // No user, fallback to light
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  return (
    <IonApp>
      <Toaster richColors/>
      <IonReactRouter>
        <IonRouterOutlet>
          
          <PublicRoute exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

          <ProtectedRoute path="/app" component={Menu} />
  
          <NotFoundRoute />
          
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
