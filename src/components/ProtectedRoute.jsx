import React from 'react';
import { Navigate } from 'react-router';
import { STORAGE_KEYS } from '../constants/storage';
import { ROUTES } from '../constants/routes';

export default function ProtectedRoute({ children }) {
  const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
  
  if (!username) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}
