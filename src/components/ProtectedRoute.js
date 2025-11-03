import React from 'react';
import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth.js';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  
  console.log('🛡️ ProtectedRoute - Authentifié:', isAuthenticated);
  console.log('🛡️ ProtectedRoute - AdminOnly:', adminOnly);
  
  if (!isAuthenticated) {
    console.log('🛡️ Redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !authUtils.isAdmin()) {
    console.log('🛡️ Accès admin refusé, redirection vers /');
    return <Navigate to="/" replace />;
  }

  console.log('🛡️ Accès autorisé');
  return children;
};

export default ProtectedRoute;