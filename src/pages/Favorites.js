import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi.js';
import { authUtils } from '../utils/auth.js';
import FavoriteButton from '../components/FavoriteButton.js';

const Favorites = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Connectez-vous pour voir vos favoris',
          returnUrl: '/favorites'
        }
      });
      return;
    }
    
    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Essayer d'abord avec l'endpoint dédié
      try {
        const favoriteProperties = await propertyApi.getFavoriteProperties();
        setProperties(favoriteProperties);
      } catch (apiError) {
        console.log('Fallback: Récupération via service favoris');
        
        // Fallback: récupérer toutes les propriétés avec statut favori
        const allProperties = await propertyApi.getPropertiesWithFavorites();
        const favoriteProperties = allProperties.filter(p => p.isFavorite === true);
        setProperties(favoriteProperties);
      }
      
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement de vos favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = (propertyId) => {
    // Mettre à jour l'état local
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const formatPrice = (price) => {
    if (!price) return 'Prix non disponible';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      const mainImage = property.images.find(img => img.isMain) || property.images[0];
      return mainImage.url;
    }
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(property.title || 'Propriété')}`;
  };

  const getPropertyType = (property) => {
    if (property.type?.displayName) return property.type.displayName;
    if (property.type) return property.type;
    return 'Non spécifié';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">❤️ Mes Favoris</h1>
              <p className="text-gray-600">
                Vos propriétés préférées ({properties.length} propriété{properties.length !== 1 ? 's' : ''})
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              ← Retour aux propriétés
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <div className="text-6xl mb-4 text-gray-300">🤍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun favori</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore ajouté de propriétés à vos favoris
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              Parcourir les propriétés
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getPropertyImage(property)}
                    alt={property.title || 'Propriété'}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  
                  {/* Bouton favori en overlay */}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton 
                      propertyId={property.id} 
                      initialIsFavorite={true}
                      onToggle={() => handleRemoveFromFavorites(property.id)}
                    />
                  </div>
                  
                  {/* Badge type */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full">
                      {getPropertyType(property)}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {property.title || 'Sans titre'}
                    </h3>
                    <span className="text-xl font-bold text-blue-600 whitespace-nowrap ml-2">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {property.description || 'Aucune description disponible'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    {property.surface && (
                      <span className="flex items-center mr-4">
                        <span className="mr-1">📏</span>
                        {property.surface} m²
                      </span>
                    )}
                    {property.bedrooms && (
                      <span className="flex items-center mr-4">
                        <span className="mr-1">🛏️</span>
                        {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center">
                        <span className="mr-1">🚿</span>
                        {property.bathrooms}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {property.status && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          property.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.status === 'AVAILABLE' ? 'Disponible' : 
                           property.status === 'PENDING' ? 'En attente' : 
                           property.status === 'SOLD' ? 'Vendu' : property.status}
                        </span>
                      )}
                      {property.city && (
                        <span className="ml-2 text-sm text-gray-600">
                          {property.city}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/property/${property.id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;