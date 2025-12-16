import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authUtils } from '../utils/auth.js';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isAuthenticated = authUtils.isAuthenticated();
  
  if (!isAuthenticated) {
    // Rediriger vers /login avec l'URL d'origine pour redirection après connexion
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !authUtils.isAdmin()) {
    // Rediriger les non-admins vers la page d'accueil
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;