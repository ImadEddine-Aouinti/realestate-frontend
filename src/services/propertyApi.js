import api from './authApi.js';

const PROPERTY_API_URL = '/properties';

export const propertyApi = {
  // Récupérer toutes les propriétés avec filtres
  async getAllProperties(filters = {}) {
    try {
      console.log('📤 Chargement des propriétés avec filtres:', filters);
      
      const hasActiveFilters = filters.type || filters.status || filters.minPrice || filters.maxPrice;
      
      let url = PROPERTY_API_URL;
      
      if (hasActiveFilters) {
        console.log('🎯 Utilisation endpoint /filter');
        url = `${PROPERTY_API_URL}/filter`;
      } else {
        console.log('🎯 Utilisation endpoint normal');
      }
      
      const response = await api.get(url, { 
        params: filters,
        paramsSerializer: {
          indexes: null
        }
      });
      
      console.log('📥 Propriétés reçues:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur property API:', error.response?.data || error.message);
      console.error('📡 Détails erreur:', error);
      
      // Fallback avec des données mock si l'API n'est pas disponible
      return this.getMockProperties();
    }
  },

  // Méthode pour les données mock
  getMockProperties() {
    return [
      {
        id: 1,
        title: "Belle maison avec jardin",
        description: "Magnifique maison de 4 pièces avec grand jardin et garage",
        price: 350000,
        type: "HOUSE",
        status: "AVAILABLE",
        surface: 120,
        bedrooms: 4,
        bathrooms: 2,
        images: []
      },
      {
        id: 2,
        title: "Appartement moderne centre-ville",
        description: "Appartement neuf de 3 pièces au cœur de la ville",
        price: 250000,
        type: "APARTMENT",
        status: "AVAILABLE",
        surface: 75,
        bedrooms: 3,
        bathrooms: 1,
        images: []
      }
    ];
  },

  // Récupérer une propriété par ID
  async getPropertyById(id) {
    try {
      const response = await api.get(`${PROPERTY_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur get property by id:', error);
      throw error;
    }
  },

  // ========== FONCTIONNALITÉS FAVORIS ==========

  // Récupérer les propriétés favorites
  async getFavoriteProperties() {
    try {
      const response = await api.get(`${PROPERTY_API_URL}/favorites`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération propriétés favorites:', error);
      return [];
    }
  },

  // Récupérer toutes les propriétés avec statut favori
  async getPropertiesWithFavorites() {
    try {
      const response = await api.get(`${PROPERTY_API_URL}/with-favorites`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération propriétés avec favoris:', error);
      return this.getAllProperties();
    }
  },

  // Vérifier si une propriété est dans les favoris
  async getFavoriteStatus(propertyId) {
    try {
      const response = await api.get(`${PROPERTY_API_URL}/${propertyId}/favorite-status`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur vérification statut favori:', error);
      return false;
    }
  },

  // AJOUTER CETTE MÉTHODE - Endpoint spécifique pour les favoris
  async toggleFavorite(propertyId) {
    try {
      // D'abord vérifier si c'est déjà un favori
      const isFavorite = await this.getFavoriteStatus(propertyId);
      
      if (isFavorite) {
        // Retirer des favoris
        const response = await api.delete(`/favorites/${propertyId}`);
        console.log('❌ Retiré des favoris:', propertyId);
        return { isFavorite: false, message: 'Retiré des favoris' };
      } else {
        // Ajouter aux favoris
        const response = await api.post('/favorites', { propertyId });
        console.log('⭐ Ajouté aux favoris:', propertyId);
        return { isFavorite: true, message: 'Ajouté aux favoris' };
      }
    } catch (error) {
      console.error('❌ Erreur toggle favorite:', error);
      throw error;
    }
  },

  // ========== GESTION DES PROPRIÉTÉS ==========

  // Créer une nouvelle propriété
  async createProperty(propertyData) {
    try {
      console.log('📤 Création de propriété:', propertyData);
      
      // Préparer les données pour l'API
      const formattedData = {
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        type: propertyData.type,
        status: propertyData.status || 'AVAILABLE',
        surface: propertyData.surface,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        rooms: propertyData.rooms,
        yearBuilt: propertyData.yearBuilt,
        address: propertyData.address,
        city: propertyData.city,
        postalCode: propertyData.postalCode,
        country: propertyData.country,
        hasParking: propertyData.hasParking,
        hasGarden: propertyData.hasGarden,
        hasPool: propertyData.hasPool,
        hasBalcony: propertyData.hasBalcony,
        hasElevator: propertyData.hasElevator,
        hasAirConditioning: propertyData.hasAirConditioning,
        hasHeating: propertyData.hasHeating,
        additionalFeatures: propertyData.additionalFeatures,
        images: propertyData.images && propertyData.images.length > 0 
          ? propertyData.images.map(img => ({
              url: img.url || `https://via.placeholder.com/600x400?text=${encodeURIComponent(propertyData.title)}`,
              altText: img.altText || propertyData.title,
              isMain: img.isMain || false
            }))
          : [
              {
                url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(propertyData.title)}`,
                altText: propertyData.title,
                isMain: true
              }
            ]
      };

      const response = await api.post(PROPERTY_API_URL, formattedData);
      console.log('✅ Propriété créée avec succès:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur création propriété:', error);
      throw error;
    }
  },

  // Mettre à jour une propriété
  async updateProperty(id, propertyData) {
    try {
      console.log(`🔄 Mise à jour propriété ${id}:`, propertyData);
      const response = await api.put(`${PROPERTY_API_URL}/${id}`, propertyData);
      console.log('✅ Propriété mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur mise à jour propriété ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une propriété
  async deleteProperty(id) {
    try {
      console.log(`🗑️ Suppression propriété ${id}`);
      await api.delete(`${PROPERTY_API_URL}/${id}`);
      console.log('✅ Propriété supprimée:', id);
      return true;
    } catch (error) {
      console.error(`❌ Erreur suppression propriété ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les propriétés de l'utilisateur connecté
  async getUserProperties() {
    try {
      console.log('🔄 Chargement des propriétés utilisateur...');
      const response = await api.get(`${PROPERTY_API_URL}/my-properties`);
      console.log('✅ Propriétés utilisateur chargées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur chargement propriétés utilisateur:', error);
      
      // Fallback : récupérer toutes les propriétés et filtrer par owner
      try {
        const allProperties = await this.getAllProperties();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Filtrer les propriétés où l'owner correspond à l'utilisateur connecté
        return allProperties.filter(p => 
          p.owner && p.owner.id === user.id
        );
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError);
        return [];
      }
    }
  },

  // ========== MÉTHODES UTILITAIRES ==========

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

  // Ajouter une propriété aux favoris (méthode directe)
  async addToFavorites(propertyId) {
    try {
      const response = await api.post('/favorites', { propertyId });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur add favorite:', error);
      throw error;
    }
  },

  // Retirer une propriété des favoris (méthode directe)
  async removeFromFavorites(propertyId) {
    try {
      await api.delete(`/favorites/${propertyId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur remove favorite:', error);
      throw error;
    }
  },

  // Contacter l'agent pour une propriété
  async contactAgent(propertyId, message) {
    try {
      const response = await api.post(`${PROPERTY_API_URL}/${propertyId}/contact`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur contact agent:', error);
      throw error;
    }
  },

  // Acheter une propriété (action protégée)
  async purchaseProperty(propertyId, purchaseData) {
    try {
      const response = await api.post(`${PROPERTY_API_URL}/${propertyId}/purchase`, purchaseData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur purchase:', error);
      throw error;
    }
  }
};

export default propertyApi;