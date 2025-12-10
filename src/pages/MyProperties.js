import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi.js';
import { authUtils } from '../utils/auth.js';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Connectez-vous pour voir vos propriétés',
          returnUrl: '/my-properties'
        }
      });
      return;
    }
    
    fetchMyProperties();
  }, [isAuthenticated, navigate]);

  // Modifier la fonction fetchMyProperties dans MyProperties.js
const fetchMyProperties = async () => {
  try {
    setLoading(true);
    
    // Essayer de récupérer les propriétés utilisateur
    try {
      const userProperties = await propertyApi.getUserProperties();
      setProperties(userProperties);
      return;
    } catch (userPropertiesError) {
      console.log("Endpoint /my-properties non disponible, fallback...");
    }
    
    // Fallback: récupérer toutes les propriétés et filtrer
    const allProperties = await propertyApi.getAllProperties();
    
    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user && user.id) {
      // Filtrer les propriétés par owner
      const userProperties = allProperties.filter(property => {
        // Vérifier si la propriété a un owner
        if (property.owner) {
          return property.owner.id === user.id;
        }
        // Fallback pour les données mock
        if (property.ownerId) {
          return property.ownerId === user.id;
        }
        return false;
      });
      
      setProperties(userProperties);
    } else {
      setProperties([]);
    }
    
  } catch (err) {
    console.error('Erreur:', err);
    setError('Erreur lors du chargement de vos propriétés');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      try {
        await propertyApi.deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression : ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-property/${id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Chargement de vos propriétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Propriétés</h1>
              <p className="text-gray-600">
                Gérez vos annonces immobilières ({properties.length} propriété{properties.length !== 1 ? 's' : ''})
              </p>
            </div>
            <button
              onClick={() => navigate('/add-property')}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center"
            >
              <span className="mr-2">+</span>
              Ajouter une propriété
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
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune propriété</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore ajouté de propriétés</p>
            <button
              onClick={() => navigate('/add-property')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              Ajouter votre première propriété
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propriété
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">🏠</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.status === 'AVAILABLE' ? 'Disponible' : 
                           property.status === 'PENDING' ? 'En attente' : 'Vendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.createdAt || new Date()).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(property.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;