import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth.js';
import { propertyApi } from '../services/propertyApi.js';

const Header = () => {
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const isAdmin = authUtils.isAdmin();
  const isAuthenticated = authUtils.isAuthenticated();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      loadFavoritesCount();
    }
  }, [isAuthenticated, isAdmin]);

  const loadFavoritesCount = async () => {
    try {
      // Récupérer les IDs des favoris
      const favoriteIds = await propertyApi.getFavoritePropertyIds();
      setFavoritesCount(favoriteIds.length);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Appeler l'API de déconnexion si elle existe
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Erreur déconnexion API:', err);
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
          <nav className="flex items-center space-x-4 md:space-x-6">
            {user ? (
              <>
                {/* Liens pour utilisateurs non-admins */}
                {!isAdmin && (
                  <>
                    <Link 
                      to="/my-properties" 
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                    >
                      <span>🏠</span>
                      <span className="font-medium hidden md:inline">Mes Propriétés</span>
                    </Link>
                    
                    {/* Lien Favoris avec badge */}
                    <Link 
                      to="/favorites" 
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group relative"
                    >
                      <span>❤️</span>
                      <span className="font-medium hidden md:inline">Favoris</span>
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {favoritesCount > 9 ? '9+' : favoritesCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link 
                      to="/add-property" 
                      className="flex items-center space-x-1 px-3 py-2 md:px-4 md:py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-lg">+</span>
                      <span className="hidden md:inline">Ajouter</span>
                    </Link>
                  </>
                )}
                {/* ============================= */}

                {/* Lien Profil */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                >
                  <span>👤</span>
                  <span className="font-medium hidden md:inline">Profil</span>
                </Link>
                
                {/* Lien Admin */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                  >
                    <span>⚙️</span>
                    <span className="font-medium hidden md:inline">Admin</span>
                  </Link>
                )}

                {/* Informations utilisateur et bouton déconnexion */}
                <div className="flex items-center space-x-3">
                  <span className="text-blue-100 font-medium px-3 py-1 bg-white/10 rounded-full hidden md:inline">
                    👋 Bonjour, {user.nom}
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-white/20 hover:bg-white/30 px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <span className="hidden md:inline">Déconnexion</span>
                    <span className="md:hidden">🚪</span>
                  </button>
                </div>
              </>
            ) : (
              /* Liens pour utilisateurs non connectés */
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  <span className="hidden md:inline">Connexion</span>
                  <span className="md:hidden">🔑</span>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="hidden md:inline">Inscription</span>
                  <span className="md:hidden">📝</span>
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