import PropTypes from 'prop-types';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();
  console.log('#### userToken', user?.token);
  if (!user?.token) return <Navigate to="/signin" state={{ path: location.pathname }} />;
  return <>{children}</>;
}

RequireAuth.propTypes = {
  children: PropTypes.node,
};
