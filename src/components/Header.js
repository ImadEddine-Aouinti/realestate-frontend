import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth.js';

const Header = () => {
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const isAdmin = authUtils.isAdmin();
  const isAuthenticated = authUtils.isAuthenticated();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    authUtils.logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">IP</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Immobilier Prestige
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                {/* ===== NOUVEAUX LIENS AJOUTÉS ===== */}
                {!isAdmin && (
                  <>
                    <Link 
                      to="/my-properties" 
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                    >
                      <span>🏠</span>
                      <span className="font-medium">Mes Propriétés</span>
                    </Link>
                    
                    <Link 
                      to="/add-property" 
                      className="flex items-center space-x-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-lg">+</span>
                      <span>Ajouter</span>
                    </Link>
                  </>
                )}
                {/* ================================ */}

                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                >
                  <span>👤</span>
                  <span className="font-medium">Profil</span>
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                  >
                    <span>⚙️</span>
                    <span className="font-medium">Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <span className="text-blue-100 font-medium px-3 py-1 bg-white/10 rounded-full">
                    👋 Bonjour, {user.nom}
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Inscription
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;