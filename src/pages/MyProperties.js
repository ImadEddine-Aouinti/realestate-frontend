import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi.js';
import { authUtils } from '../utils/auth.js';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    propertyId: null,
    propertyTitle: ''
  });
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

  const openDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      propertyId: id,
      propertyTitle: title
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      propertyId: null,
      propertyTitle: ''
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.propertyId) return;

    try {
      await propertyApi.deleteProperty(deleteModal.propertyId);
      setProperties(properties.filter(p => p.id !== deleteModal.propertyId));
      
      // Afficher une notification de succès
      showNotification('success', 'Propriété supprimée avec succès !');
      
    } catch (err) {
      showNotification('error', 'Erreur lors de la suppression : ' + (err.response?.data?.message || err.message));
    } finally {
      closeDeleteModal();
    }
  };

  const showNotification = (type, message) => {
    // Créer une div pour la notification
    const notification = document.createElement('div');
    
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border ${colors[type]} shadow-lg max-w-md transform transition-all duration-300 translate-y-0 opacity-100`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100">
          <span class="sr-only">Fermer</span>
          <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss après 5 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateY(-100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
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
      {/* Modal de confirmation de suppression */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeDeleteModal}
            ></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer la propriété "<span className="font-semibold text-gray-700">{deleteModal.propertyTitle}</span>" ?
                      </p>
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Cette action est irréversible !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Oui, supprimer
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Ajouter votre première propriété
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Propriété
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {properties.map((property) => (
                    <tr 
                      key={property.id} 
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-14 h-14">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-gray-200">
                                <span className="text-2xl text-gray-400">🏠</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${
                          property.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : property.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {property.status === 'AVAILABLE' ? '✅ Disponible' : 
                           property.status === 'PENDING' ? '⏳ En attente' : '❌ Vendu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(property.createdAt || new Date()).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 group"
                            title="Voir les détails"
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="ml-1 hidden sm:inline">Voir</span>
                            </div>
                          </button>
                          <button
                            onClick={() => handleEdit(property.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors duration-200 group"
                            title="Modifier"
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="ml-1 hidden sm:inline">Modifier</span>
                            </div>
                          </button>
                          <button
                            onClick={() => openDeleteModal(property.id, property.title)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200 group"
                            title="Supprimer"
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="ml-1 hidden sm:inline">Supprimer</span>
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer du tableau */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{properties.length}</span> propriété{properties.length !== 1 ? 's' : ''} au total
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {properties.filter(p => p.status === 'AVAILABLE').length}
                  </span> disponible{properties.filter(p => p.status === 'AVAILABLE').length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles pour les notifications */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        .notification-enter {
          animation: fadeInUp 0.3s ease-out;
        }
        
        .notification-exit {
          animation: fadeOutUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyProperties;