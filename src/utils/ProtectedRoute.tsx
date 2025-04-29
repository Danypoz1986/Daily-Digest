import React, { useEffect, useState } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useIonRouter } from '@ionic/react';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const RedirectToLogin: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const db = getFirestore();
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setRegistering(!!data.registering);
          }
        } catch (err) {
          console.error("🔥 Error checking registering state:", err);
        }
      } else {
        setUser(null);
        setRegistering(false);
      }

      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!ready) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        user && !registering ? (
          <Component {...props} />
        ) : (
          <RedirectToLogin />
        )
      }
    />
  );
};

export default ProtectedRoute;



