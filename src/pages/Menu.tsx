import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonPage, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonMenuToggle, IonIcon, IonButton, IonAvatar, IonLabel, IonRouterOutlet, useIonLoading } from '@ionic/react';
import { Redirect, Route, Switch, useHistory } from 'react-router';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import Home from './Home';
import Search from './Search';
import Favorites from './Favorites';
import Metrics from './Metrics';
import Settings from './Settings';
import About from './About';
import UserSettings from './UserSettings';
import NotFound from './NotFound';
import Theme from './Theme';
import { homeOutline, searchOutline, heartOutline, statsChartOutline, settingsOutline, informationCircleOutline, logOutOutline } from 'ionicons/icons';

const Menu: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [present, dismiss] = useIonLoading();
  const history = useHistory();
  const auth = getAuth();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const [dark, setDark] = useState(false);
  const lastFirestoreUpdate = useRef<number>(0);

  
    
      useEffect(() => {
        const fetchDarkMode = async () => {
          const auth = getAuth();
          const user = auth.currentUser;
          const db = getFirestore();
      
          if (user) {
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userSnap = await getDoc(userDocRef);
      
              if (userSnap.exists() && typeof userSnap.data().darkMode === "boolean") {
                setDark(userSnap.data().darkMode);
              } else {
                setDark(false); // If darkMode field doesn't exist, fallback to light mode
              }
            } catch (error) {
              console.error("Error fetching dark mode from Firestore:", error);
              setDark(false); // Fallback to light if error
            }
          } else {
            setDark(false); // No user logged in, fallback to light
          }
        };
      
        fetchDarkMode();
      }, []);
  
      useEffect(() => {
        const handleDarkModeChange = (event: Event) => {
          const customEvent = event as CustomEvent<{ dark: boolean }>;
          setDark(customEvent.detail.dark);
        };
      
        window.addEventListener('darkmode-changed', handleDarkModeChange);
      
        return () => {
          window.removeEventListener('darkmode-changed', handleDarkModeChange);
        };
      }, []);
      
      
      

  const logout = useCallback(async (type: "manual" | "auto" = "manual") => {
    

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null; // Clear it
    }

    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);

    try {
      await present('Logging out...');

      // You can keep Firestore logout flag if you want, but not necessary for activity
      await setDoc(userRef, {
        session: { logoutInProgress: true, logoutType: type }
      }, { merge: true });

      await signOut(auth);
      history.replace('/login');

      toast[type === "manual" ? "success" : "info"](
        type === "manual"
          ? "You have logged out successfully!"
          : "Session expired due to inactivity. You have been logged out!",
        {
          position: 'top-center',
          duration: 4000,
        }
      );

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed. Please try again.", {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      await dismiss();
    }
  }, [dismiss, present, history, auth, inactivityTimer]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!userId) return;

    const checkLastActivityOnStart = async () => {
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const lastActivity = userSnap.data()?.session?.lastActivity || 0;

      const now = Date.now();
      const timeoutLimit = 3 * 60 * 1000;

      if (lastActivity && now - parseInt(lastActivity, 10) > timeoutLimit) {
        console.log("🚪 Reopened after being inactive. Logging out...");
        logout("auto");
      }
    };

    const resetTimer = async () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }

      const now = Date.now();
      const db = getFirestore();
      const user = getAuth().currentUser;
      if (!user) return;

      if (now - lastFirestoreUpdate.current > 60000) {
        await setDoc(doc(db, "users", user.uid), {
          session: { lastActivity: now }
        }, { merge: true });

        lastFirestoreUpdate.current = now;
      }

      inactivityTimer.current = setTimeout(() => {
        console.log("🚪 Auto-logout due to inactivity");
        logout("auto");
      }, 3 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "touchstart"];
    const handleActivity = () => {
      resetTimer();
    };

    (async () => {
      await checkLastActivityOnStart();
      await resetTimer();
    })();

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [userId, logout]);


  const paths = [
    { name: 'Home', url: '/app/home', icon: homeOutline },
    { name: 'Search', url: '/app/search', icon: searchOutline },
    { name: 'Favorites', url: '/app/favorites', icon: heartOutline },
    { name: 'Metrics', url: '/app/metrics', icon: statsChartOutline },
    { name: 'Settings', url: '/app/settings', icon: settingsOutline },
    { name: 'About', url: '/app/about', icon: informationCircleOutline }
  ];

  return (
    <IonPage>
      <IonSplitPane contentId="main">
        <IonMenu contentId="main">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle style={{color:"white"}}>Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem lines="none" style={{ marginTop: '10px', marginLeft: '-5px', marginBottom: '10px' }}>
              <IonAvatar slot="start">
                <img src={currentUser?.photoURL || 'https://www.gravatar.com/avatar?d=mp&s=200'} alt="User Avatar" />
              </IonAvatar>
              <IonLabel>
                <h2 style={{ fontWeight: 'bold' }}>{currentUser?.email?.split('@')[0] || 'User'}</h2>
              </IonLabel>
            </IonItem>
            {paths.map((item, index) => (
              <IonMenuToggle key={index} autoHide={false} >
                <IonItem routerLink={item.url} routerDirection="none">
                  <IonIcon slot="start" icon={item.icon} style={{ color: dark ? '#ffffff' : '#000000' }} />
                  {item.name}
                </IonItem>
              </IonMenuToggle>
            ))}
            <IonMenuToggle autoHide={false}>
              <IonButton expand="full" onClick={() => logout("manual")} routerDirection="root" color="danger">
                <IonIcon slot="start" icon={logOutOutline}  />
                Logout
              </IonButton>
            </IonMenuToggle>
          </IonContent>
        </IonMenu>

        <IonRouterOutlet id="main">
          <Switch>
            <Route exact path="/app/home" component={Home} />
            <Route exact path="/app/search" component={Search} />
            <Route exact path="/app/favorites" component={Favorites} />
            <Route exact path="/app/metrics" component={Metrics} />
            <Route path="/app/settings" component={Settings} />
            <Route exact path="/app/settings/user-settings" component={UserSettings} />
            <Route exact path="/app/settings/theme" component={Theme} />
            <Route exact path="/app/about" component={About} />
            <Route exact path="/app/not-found" component={NotFound} />
            <Route exact path="/app">
              <Redirect to="/app/home" />
            </Route>
            <Route path="/app/:path">
              <NotFound />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonPage>
  );
};

export default Menu;
