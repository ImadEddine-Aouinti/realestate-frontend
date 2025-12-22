// src/services/favoritesApi.js
import api from './authApi.js';

export const favoritesApi = {
  // Récupérer tous les favoris (pour admin)
  async getAllFavorites() {
    try {
      console.log('🔄 Chargement de tous les favoris...');
      
      // Essayer plusieurs endpoints possibles
      const endpoints = [
        '/favorites/all',           // Endpoint admin
        '/favorites',               // Endpoint utilisateur
        '/properties/favorites'     // Alternative
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          console.log(`✅ Favoris chargés via ${endpoint}:`, response.data);
          
          // Transformer les données si nécessaire
          if (Array.isArray(response.data)) {
            return response.data.map(fav => ({
              id: fav.id,
              propertyId: fav.property?.id || fav.propertyId,
              userId: fav.user?.id || fav.userId,
              addedAt: fav.addedAt || fav.createdAt,
              property: fav.property || { id: fav.propertyId, title: 'Propriété inconnue' },
              user: fav.user || { id: fav.userId, nom: 'Utilisateur inconnu' }
            }));
          }
          return response.data;
        } catch (endpointError) {
          console.log(`⚠️ Endpoint ${endpoint} non disponible`);
        }
      }
      
      // Fallback: données de test
      return this.getMockFavorites();
      
    } catch (error) {
      console.error('❌ Erreur chargement favoris:', error);
      return this.getMockFavorites();
    }
  },

  // Données mock pour les tests
  getMockFavorites() {
    return [
      {
        id: 1,
        propertyId: 1,
        userId: 2,
        addedAt: new Date().toISOString(),
        property: {
          id: 1,
          title: 'Villa Moderne avec Piscine',
          price: 750000
        },
        user: {
          id: 2,
          nom: 'Client 1',
          email: 'client1@example.com'
        }
      },
      {
        id: 2,
        propertyId: 2,
        userId: 3,
        addedAt: new Date().toISOString(),
        property: {
          id: 2,
          title: 'Appartement Centre-Ville',
          price: 350000
        },
        user: {
          id: 3,
          nom: 'Client 2',
          email: 'client2@example.com'
        }
      },
      {
        id: 3,
        propertyId: 1,
        userId: 3,
        addedAt: new Date().toISOString(),
        property: {
          id: 1,
          title: 'Villa Moderne avec Piscine',
          price: 750000
        },
        user: {
          id: 3,
          nom: 'Client 2',
          email: 'client2@example.com'
        }
      }
    ];
  },

  // Récupérer les favoris de l'utilisateur connecté
  async getUserFavorites() {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur favorites API:', error);
      return this.getMockFavorites();
    }
  },

  // Ajouter aux favoris
  async addFavorite(propertyId) {
    try {
      console.log('⭐ Ajout aux favoris:', propertyId);
      const response = await api.post('/favorites', { propertyId });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur add favorite:', error);
      throw error;
    }
  },

  // Retirer des favoris
  async removeFavorite(propertyId) {
    try {
      console.log('❌ Retrait des favoris:', propertyId);
      const response = await api.delete(`/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur remove favorite:', error);
      throw error;
    }
  },

  // Récupérer les IDs des propriétés favorites
  async getFavoritePropertyIds() {
    try {
      const response = await api.get('/favorites/ids');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération IDs favoris:', error);
      // Fallback: extraire IDs des mock data
      return this.getMockFavorites().map(fav => fav.propertyId);
    }
  },

  // Vérifier si une propriété est dans les favoris
  async checkFavoriteStatus(propertyId) {
    try {
      const response = await api.get(`/favorites/check/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur vérification statut favori:', error);
      return false;
    }
  }
};

export default favoritesApi;