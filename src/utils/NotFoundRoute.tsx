// src/utils/NotFoundRoute.tsx
import React from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import NotFound from '../pages/NotFound';

const NotFoundRoute: React.FC = () => {
  const location = useLocation();

  // if already on not-found route, just render the page
  if (location.pathname === '/not-found' || location.pathname === '/app/not-found') {
    return <Route component={NotFound} />;
  }

  return (
    <Route path="*">
      <Redirect to='/app/not-found' />
    </Route>
  );
};

export default NotFoundRoute;
