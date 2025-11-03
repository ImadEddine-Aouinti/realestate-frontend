import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi';
import { authUtils } from '../utils/auth';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const user = authUtils.getUser();
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    fetchPropertyDetails();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [id, isAuthenticated]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des détails de la propriété:', id);
      const propertyData = await propertyApi.getPropertyById(id);
      console.log('✅ Détails chargés:', propertyData);
      setProperty(propertyData);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Propriété non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favoritesData = await propertyApi.getUserFavorites();
      setFavorites(favoritesData.map(fav => fav.propertyId || fav.id));
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      showNotification(
        'Veuillez vous connecter pour ajouter aux favoris',
        'warning'
      );
      
      // Redirection après un court délai pour voir la notification
      setTimeout(() => {
        navigate('/login', {
          state: { 
            message: 'Veuillez vous connecter pour gérer vos favoris',
            returnUrl: `/property/${id}`
          }
        });
      }, 1500);
      return;
    }

    try {
      const isCurrentlyFavorite = favorites.includes(property.id);
      
      if (isCurrentlyFavorite) {
        await propertyApi.removeFromFavorites(property.id);
        setFavorites(favorites.filter(favId => favId !== property.id));
        showNotification('Propriété retirée des favoris', 'success');
      } else {
        await propertyApi.addToFavorites(property.id);
        setFavorites([...favorites, property.id]);
        showNotification('Propriété ajoutée aux favoris', 'success');
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
      showNotification('Erreur lors de la modification des favoris', 'error');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification(
        'Veuillez vous connecter pour contacter l\'agent',
        'warning'
      );
      
      setTimeout(() => {
        navigate('/login', {
          state: { 
            message: 'Veuillez vous connecter pour contacter l\'agent',
            returnUrl: `/property/${id}`
          }
        });
      }, 1500);
      return;
    }

    try {
      console.log('Message envoyé:', contactForm);
      showNotification('Votre message a été envoyé à l\'agent!', 'success');
      setShowContactForm(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      showNotification('Erreur lors de l\'envoi du message', 'error');
    }
  };

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Fonction pour fermer manuellement la notification
  const closeNotification = () => {
    setNotification({ show: false, message: '', type: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Chargement des détails...</div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Propriété non trouvée</h2>
          <p className="text-gray-600 mb-6">{error || 'La propriété que vous recherchez n\'existe pas.'}</p>
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(property.id);
  const mainImage = property.images && property.images.length > 0 
    ? property.images[currentImageIndex]?.url 
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Notification System */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-green-50 border-green-200 text-green-800'
        } border-l-4 rounded-lg shadow-lg p-4 transition-all duration-300 transform translate-x-0`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'error' ? '❌' :
               notification.type === 'warning' ? '⚠️' : '✅'}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={closeNotification}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          {/* Progress bar */}
          <div className={`mt-2 h-1 rounded-full ${
            notification.type === 'error' ? 'bg-red-300' :
            notification.type === 'warning' ? 'bg-yellow-300' :
            'bg-green-300'
          }`}>
            <div 
              className="h-full rounded-full bg-current transition-all duration-5000 ease-linear"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <span className="mr-2">←</span>
              Retour aux propriétés
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Accueil</span>
              <span>›</span>
              <span>Propriétés</span>
              <span>›</span>
              <span className="text-gray-900 font-semibold truncate max-w-xs">
                {property.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl">
              <img 
                src={mainImage} 
                alt={property.title}
                className="w-full h-96 object-cover"
              />
              
              {/* Navigation images */}
              {property.images && property.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                  >
                    ›
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}

              {/* Badge statut */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  property.status === 'AVAILABLE' ? 'bg-green-500 text-white' :
                  property.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                } shadow-lg`}>
                  {property.status === 'AVAILABLE' ? '🟢 Disponible' :
                   property.status === 'PENDING' ? '🟡 En attente' : '🔴 Vendu'}
                </span>
              </div>
            </div>

            {/* Miniatures */}
            {property.images && property.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <span className="mr-2">📍</span>
                  {property.address}, {property.postalCode} {property.city}, {property.country}
                </p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500'
                  } hover:scale-110`}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                <button 
                  className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showNotification('Lien copié dans le presse-papier!', 'success');
                  }}
                >
                  📤
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {formatPrice(property.price)}
              </div>
              <div className="text-gray-500">
                {property.type === 'APARTMENT' ? 'Pour un appartement' :
                 property.type === 'HOUSE' ? 'Pour une maison' :
                 property.type === 'VILLA' ? 'Pour une villa' : 'À vendre'}
              </div>
            </div>

            {/* Caractéristiques principales */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📐</div>
                <div className="text-lg font-bold text-gray-900">{property.surface} m²</div>
                <div className="text-sm text-gray-600">Surface</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-lg font-bold text-gray-900">{property.bedrooms}</div>
                <div className="text-sm text-gray-600">Chambres</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🚿</div>
                <div className="text-lg font-bold text-gray-900">{property.bathrooms}</div>
                <div className="text-sm text-gray-600">Salles de bain</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🏠</div>
                <div className="text-lg font-bold text-gray-900">{property.rooms}</div>
                <div className="text-sm text-gray-600">Pièces totales</div>
              </div>

              {property.yearBuilt && (
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-lg font-bold text-gray-900">{property.yearBuilt}</div>
                  <div className="text-sm text-gray-600">Année de construction</div>
                </div>
              )}

              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🏷️</div>
                <div className="text-lg font-bold text-gray-900">
                  {property.type === 'HOUSE' ? 'Maison' :
                   property.type === 'APARTMENT' ? 'Appartement' : 'Villa'}
                </div>
                <div className="text-sm text-gray-600">Type</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Équipements */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Équipements & Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.hasParking && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🚗</span>
                    <span className="text-sm font-medium">Parking</span>
                  </div>
                )}
                {property.hasGarden && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🌳</span>
                    <span className="text-sm font-medium">Jardin</span>
                  </div>
                )}
                {property.hasPool && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🏊</span>
                    <span className="text-sm font-medium">Piscine</span>
                  </div>
                )}
                {property.hasBalcony && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🌅</span>
                    <span className="text-sm font-medium">Balcon</span>
                  </div>
                )}
                {property.hasElevator && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🛗</span>
                    <span className="text-sm font-medium">Ascenseur</span>
                  </div>
                )}
                {property.hasAirConditioning && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>❄️</span>
                    <span className="text-sm font-medium">Climatisation</span>
                  </div>
                )}
                {property.hasHeating && (
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span>🔥</span>
                    <span className="text-sm font-medium">Chauffage</span>
                  </div>
                )}
              </div>

              {property.additionalFeatures && (
                <div className="mt-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Caractéristiques supplémentaires</h4>
                  <p className="text-green-800 text-sm">{property.additionalFeatures}</p>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowContactForm(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>👤</span>
                <span>Contacter l'agent</span>
              </button>
              <button className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <span>📞</span>
                <span>Appeler maintenant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de contact modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Contacter l'agent</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows="5"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder={`Bonjour, je suis intéressé(e) par la propriété "${property.title}"...`}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button" 
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setShowContactForm(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;