import React, { useState, useEffect } from 'react';
import { favoritesApi } from '../services/favoritesApi.js';
import { authUtils } from '../utils/auth.js';

const FavoriteButton = ({ 
  propertyId, 
  size = 'md', 
  showText = false, 
  initialIsFavorite = false,
  onToggle,
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated && propertyId && initialIsFavorite === false) {
      checkFavoriteStatus();
    }
  }, [propertyId, isAuthenticated, initialIsFavorite]);

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const isFav = await favoritesApi.checkFavoriteStatus(propertyId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Erreur vérification favori:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Connectez-vous pour ajouter aux favoris');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(propertyId);
        setIsFavorite(false);
        if (onToggle) onToggle(false);
      } else {
        await favoritesApi.addFavorite(propertyId);
        setIsFavorite(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error('Erreur modification favori:', error);
      alert(error.message || 'Erreur lors de la modification des favoris');
    } finally {
      setLoading(false);
    }
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const buttonClass = `
    ${sizes[size]} 
    rounded-full flex items-center justify-center 
    transition-all duration-300
    ${isFavorite 
      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
    }
    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    shadow-md hover:shadow-lg
    ${className}
  `;

  const heartIcon = isFavorite ? '❤️' : '🤍';

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => alert('Connectez-vous pour ajouter aux favoris')}
        className={`${sizes[size]} rounded-full bg-gray-100 text-gray-400 flex items-center justify-center`}
        title="Connectez-vous pour ajouter aux favoris"
      >
        🤍
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleFavoriteToggle}
        disabled={loading}
        className={buttonClass}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          heartIcon
        )}
      </button>
      
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris'}
        </span>
      )}
    </div>
  );
};

export default FavoriteButton;