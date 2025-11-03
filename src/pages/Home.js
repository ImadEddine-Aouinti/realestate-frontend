import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth.js';
import { propertyApi } from '../services/propertyApi.js';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: 'AVAILABLE',
    minPrice: '',
    maxPrice: ''
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalProperties: 0,
    happyClients: 0,
    citiesCovered: 0,
    yearsExperience: 0
  });

  const user = authUtils.getUser();
  const isAuthenticated = authUtils.isAuthenticated();
  const navigate = useNavigate();

  // Données dynamiques pour le carousel Hero
  const heroSlides = [
    {
      title: "Trouvez Votre Maison de Rêve",
      description: "Découvrez notre sélection exclusive de propriétés premium dans les meilleurs quartiers",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Explorer Maintenant"
    },
    {
      title: "Investissez dans l'Immobilier",
      description: "Des opportunités d'investissement uniques avec des rendements exceptionnels",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Découvrir les Offres"
    },
    {
      title: "Vendez au Meilleur Prix",
      description: "Notre réseau d'experts vous garantit la meilleure valorisation de votre bien",
      image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Estimer Mon Bien"
    }
  ];

  useEffect(() => {
    fetchProperties();
    if (isAuthenticated) {
      fetchFavorites();
    }
    loadStats();
    
    // Carousel automatique
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des propriétés...');
      const propertiesData = await propertyApi.getAllProperties(filters);
      console.log('✅ Propriétés chargées:', propertiesData);
      setProperties(propertiesData);
      
      // Mettre à jour les stats avec les vraies données
      setStats(prev => ({
        ...prev,
        totalProperties: propertiesData.length
      }));
    } catch (error) {
      console.error('❌ Erreur lors du chargement des propriétés:', error);
      // En cas d'erreur, afficher des propriétés de démonstration
      setProperties(getDemoProperties());
    } finally {
      setLoading(false);
    }
  };

  // Fonction de démonstration si l'API ne répond pas
  const getDemoProperties = () => {
    return [
      {
        id: 1,
        title: "Villa Moderne avec Piscine",
        description: "Magnifique villa contemporaine avec piscine privative et jardin paysager. Située dans un quartier résidentiel calme.",
        price: 750000,
        type: "VILLA",
        status: "AVAILABLE",
        images: [
          { url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      },
      {
        id: 2,
        title: "Appartement Centre-Ville",
        description: "Bel appartement lumineux au cœur de la ville, proche de tous les commerces et transports.",
        price: 350000,
        type: "APARTMENT",
        status: "AVAILABLE",
        images: [
          { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      },
      {
        id: 3,
        title: "Maison de Famille Spacieuse",
        description: "Parfaite pour une famille, cette maison offre 4 chambres et un grand jardin arboré.",
        price: 520000,
        type: "HOUSE",
        status: "PENDING",
        images: [
          { url: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      },
      {
        id: 4,
        title: "Duplex avec Terrasse",
        description: "Superbe duplex avec grande terrasse offrant une vue panoramique sur la ville.",
        price: 420000,
        type: "APARTMENT",
        status: "AVAILABLE",
        images: [
          { url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      },
      {
        id: 5,
        title: "Villa d'Architecte",
        description: "Villa exceptionnelle signée par un architecte renommé, avec piscine et garage double.",
        price: 890000,
        type: "VILLA",
        status: "AVAILABLE",
        images: [
          { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      },
      {
        id: 6,
        title: "Studio Étudiant",
        description: "Studio fonctionnel idéal pour étudiant, proche des universités et commodités.",
        price: 180000,
        type: "APARTMENT",
        status: "SOLD",
        images: [
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", isMain: true }
        ]
      }
    ];
  };

  const fetchFavorites = async () => {
    try {
      console.log('🔄 Chargement des favoris...');
      const favoritesData = await propertyApi.getUserFavorites();
      console.log('✅ Favoris chargés:', favoritesData);
      setFavorites(favoritesData.map(fav => fav.propertyId || fav.id));
    } catch (error) {
      console.error('❌ Erreur lors du chargement des favoris:', error);
    }
  };

  const loadStats = async () => {
    // Simulation de données statistiques
    setStats({
      totalProperties: properties.length || 1250,
      happyClients: 890,
      citiesCovered: 45,
      yearsExperience: 12
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 Recherche avec filtres:', filters);
    fetchProperties();
  };

  const handleFavoriteToggle = async (propertyId) => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      navigate('/login', {
        state: {
          message: 'Veuillez vous connecter pour gérer vos favoris'
        }
      });
      return;
    }

    try {
      const isCurrentlyFavorite = favorites.includes(propertyId);
      console.log(`⭐ ${isCurrentlyFavorite ? 'Retrait' : 'Ajout'} des favoris pour:`, propertyId);
      
      if (isCurrentlyFavorite) {
        await propertyApi.removeFromFavorites(propertyId);
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        await propertyApi.addToFavorites(propertyId);
        setFavorites([...favorites, propertyId]);
      }
    } catch (error) {
      console.error('❌ Erreur avec les favoris:', error);
      alert('Erreur lors de la modification des favoris');
    }
  };

  const handleContactAgent = async (propertyId) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Veuillez vous connecter pour contacter l\'agent',
          returnUrl: `/property/${propertyId}`
        }
      });
      return;
    }

    try {
      const message = prompt('Votre message à l\'agent:');
      if (message) {
        await propertyApi.contactAgent(propertyId, message);
        alert('Message envoyé à l\'agent!');
      }
    } catch (error) {
      console.error('Erreur contact agent:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleViewDetails = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: 'AVAILABLE',
      minPrice: '',
      maxPrice: ''
    });
    console.log('🗑️ Filtres effacés');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Chargement des propriétés...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section Dynamique */}
      <div className="relative h-screen overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
            </div>
          ))}
        </div>

        {/* Navigation du carousel */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          ›
        </button>

        {/* Indicateurs de slide */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Contenu Hero */}
        <div className="relative z-5 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="mb-6">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  🏆 Agence N°1 en Maroc
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {heroSlides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => document.getElementById('property-list').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105"
                >
                  {heroSlides[currentSlide].cta}
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
                  📞 Nous Contacter
                </button>
              </div>

              {/* Statistiques en temps réel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {properties.length}+
                  </div>
                  <div className="text-blue-100 text-sm">Propriétés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stats.happyClients}+
                  </div>
                  <div className="text-blue-100 text-sm">Clients Satisfaits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stats.citiesCovered}+
                  </div>
                  <div className="text-blue-100 text-sm">Villes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stats.yearsExperience}+
                  </div>
                  <div className="text-blue-100 text-sm">Ans d'Expérience</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                  opacity=".25" className="fill-white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                  opacity=".5" className="fill-white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                  className="fill-white"></path>
          </svg>
        </div>
      </div>

      {/* Section des propriétés */}
      <div id="property-list" className="container mx-auto px-4 py-16">
        {/* Filtres de recherche */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-16 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Recherche Avancée</h2>
          <p className="text-gray-600 mb-8">Affinez votre recherche selon vos critères</p>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type de bien</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
              >
                <option value="">Tous les types</option>
                <option value="HOUSE">🏠 Maison</option>
                <option value="APARTMENT">🏢 Appartement</option>
                <option value="VILLA">🏰 Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Statut</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
              >
                <option value="AVAILABLE">🟢 Disponible</option>
                <option value="PENDING">🟡 En attente</option>
                <option value="SOLD">🔴 Vendu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Prix min (€)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Prix max (€)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="∞"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
              />
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                🔍 Rechercher
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                🗑️
              </button>
            </div>
          </form>
        </div>

        {/* Liste des propriétés */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Propriétés Disponibles
              </h2>
              <p className="text-gray-600 mt-2">
                {properties.length} bien{properties.length > 1 ? 's' : ''} correspondant à vos critères
              </p>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-500 text-lg font-semibold">Aucune propriété trouvée</p>
              <p className="text-gray-400 mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images.find(img => img.isMain)?.url || property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl">🏠</span>
                      </div>
                    )}
                    
                    {/* Badge statut */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        property.status === 'AVAILABLE' ? 'bg-green-500 text-white' :
                        property.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      } shadow-lg`}>
                        {property.status === 'AVAILABLE' ? '🟢 Disponible' :
                         property.status === 'PENDING' ? '🟡 En attente' : '🔴 Vendu'}
                      </span>
                    </div>

                    {/* Bouton favori */}
                    <button
                      onClick={() => handleFavoriteToggle(property.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-xl shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                    >
                      {favorites.includes(property.id) ? (
                        <span className="text-red-500 text-lg">❤️</span>
                      ) : (
                        <span className="text-gray-400 text-lg">🤍</span>
                      )}
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                        {property.title}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">
                        {property.type === 'HOUSE' ? '🏠 Maison' :
                         property.type === 'APARTMENT' ? '🏢 Appartement' : '🏰 Villa'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>

                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(property.price)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => handleViewDetails(property.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        📋 Voir les détails
                      </button>
                      <button 
                        onClick={() => handleContactAgent(property.id)}
                        className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200"
                      >
                        👤 Contacter l'agent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;