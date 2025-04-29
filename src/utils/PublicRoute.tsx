import React, { useEffect, useState } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface PublicRouteProps extends RouteProps {
  component?: React.ComponentType<any>;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || !Component) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Redirect to="/app/home" /> : <Component {...props} />
      }
    />
  );
};

export default PublicRoute;
