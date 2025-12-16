import { adminApi } from '../../services/authApi.js'; // ← AJOUTEZ .js
import { propertyApi } from '../../services/propertyApi.js'; // ← AJOUTEZ .js
import { favoritesApi } from '../../services/favoritesApi.js'; // ← AJOUTEZ .js

// Fonction pour charger toutes les données
export const fetchAllData = async (setLoading, setError) => {
  try {
    setLoading(true);
    setError('');
    
    const [usersData, propertiesData, favoritesData] = await Promise.all([
      adminApi.getUsers(),
      propertyApi.getAllProperties(),
      favoritesApi.getAllFavorites()
    ]);
    
    console.log('✅ Données chargées:', {
      users: usersData.length,
      properties: propertiesData.length,
      favorites: favoritesData.length
    });
    
    return { users: usersData, properties: propertiesData, favorites: favoritesData };
  } catch (err) {
    console.error('❌ Erreur lors du chargement des données:', err);
    setError('Erreur lors du chargement des données: ' + (err.response?.data?.message || err.message));
    return null;
  } finally {
    setLoading(false);
  }
};

// Fonction pour calculer les statistiques globales
export const calculateGlobalStats = (users, properties, favorites) => {
  return {
    // Utilisateurs
    totalUsers: users.length,
    activeUsers: users.filter(u => u.enabled).length,
    adminUsers: users.filter(u => u.role === 'ROLE_ADMIN').length,
    newUsersToday: users.filter(u => {
      const today = new Date().toDateString();
      const userDate = new Date(u.createdAt).toDateString();
      return userDate === today;
    }).length,
    
    // Propriétés
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'AVAILABLE').length,
    soldProperties: properties.filter(p => p.status === 'SOLD').length,
    pendingProperties: properties.filter(p => p.status === 'PENDING').length,
    totalPropertyValue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
    
    // Favoris
    totalFavorites: favorites.length,
    averageFavoritesPerUser: users.length > 0 ? (favorites.length / users.length).toFixed(1) : 0,
    mostLikedProperty: properties.reduce((max, p) => {
      const favoritesCount = favorites.filter(f => f.propertyId === p.id).length;
      return favoritesCount > (max.count || 0) ? { property: p, count: favoritesCount } : max;
    }, { property: null, count: 0 }),
    
    // Types de propriétés
    propertyTypes: {
      APARTMENT: properties.filter(p => p.type === 'APARTMENT').length,
      HOUSE: properties.filter(p => p.type === 'HOUSE').length,
      VILLA: properties.filter(p => p.type === 'VILLA').length,
      OFFICE: properties.filter(p => p.type === 'OFFICE').length,
      COMMERCIAL: properties.filter(p => p.type === 'COMMERCIAL').length,
      LAND: properties.filter(p => p.type === 'LAND').length
    },
    
    // Distribution des prix
    priceDistribution: {
      under100k: properties.filter(p => p.price < 100000).length,
      '100k-300k': properties.filter(p => p.price >= 100000 && p.price < 300000).length,
      '300k-500k': properties.filter(p => p.price >= 300000 && p.price < 500000).length,
      '500k-1M': properties.filter(p => p.price >= 500000 && p.price < 1000000).length,
      over1M: properties.filter(p => p.price >= 1000000).length
    },
    
    // Top propriétaires
    topOwners: Object.entries(
      properties.reduce((acc, p) => {
        if (p.owner) {
          acc[p.owner.id] = {
            owner: p.owner,
            count: (acc[p.owner.id]?.count || 0) + 1,
            totalValue: (acc[p.owner.id]?.totalValue || 0) + (p.price || 0)
          };
        }
        return acc;
      }, {})
    )
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5),
    
    // Activité récente
    recentProperties: [...properties]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    
    recentUsers: [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };
};

// Fonctions de formatage
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price);
};

// Fonctions d'icônes
export const getRoleIcon = (role) => role === 'ROLE_ADMIN' ? '👑' : '👤';
export const getStatusIcon = (enabled) => enabled ? '🟢' : '🔴';

export const getPropertyStatusIcon = (status) => {
  switch(status) {
    case 'AVAILABLE': return '🟢';
    case 'PENDING': return '🟡';
    case 'SOLD': return '🔴';
    case 'RENTED': return '🔵';
    default: return '⚪';
  }
};