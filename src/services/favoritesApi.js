// src/services/favoritesApi.js
import api from './authApi.js';

export const favoritesApi = {
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

  // Récupérer les favoris de l'utilisateur
  async getUserFavorites() {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur favorites API:', error);
      return [];
    }
  },

  // Récupérer les IDs des propriétés favorites
  async getFavoritePropertyIds() {
    try {
      const response = await api.get('/favorites/ids');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération IDs favoris:', error);
      return [];
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