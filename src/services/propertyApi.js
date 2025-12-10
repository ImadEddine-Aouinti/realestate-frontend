import api from './authApi.js';

// Correction : utilisez le bon chemin - sans /api car déjà dans la baseURL
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

  // Récupérer les favoris de l'utilisateur
  async getUserFavorites() {
    try {
      const response = await api.get(`${PROPERTY_API_URL}/favorites`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur favorites API:', error);
      return [];
    }
  },

  // Ajouter aux favoris
  async addToFavorites(propertyId) {
    try {
      console.log('⭐ Ajout aux favoris:', propertyId);
      const response = await api.post(`${PROPERTY_API_URL}/${propertyId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur add favorite:', error);
      throw error;
    }
  },

  // Retirer des favoris
  async removeFromFavorites(propertyId) {
    try {
      console.log('❌ Retrait des favoris:', propertyId);
      const response = await api.delete(`${PROPERTY_API_URL}/${propertyId}/favorite`);
      return response.data;
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
  },

  // ========== NOUVELLES MÉTHODES AJOUTÉES ==========

  // Créer une nouvelle propriété
  // Dans propertyApi.js, modifier la méthode createProperty
async createProperty(propertyData) {
  try {
    console.log('📤 Création de propriété:', propertyData);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }

    // Ajouter une image par défaut si aucune image n'est fournie
    const dataToSend = {
      ...propertyData,
      // Ajouter une image par défaut si aucune image
      images: propertyData.images && propertyData.images.length > 0 
        ? propertyData.images 
        : [
            {
              url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(propertyData.title)}`,
              altText: propertyData.title,
              isMain: true
            }
          ]
    };

    const response = await api.post(PROPERTY_API_URL, dataToSend);
    console.log('✅ Propriété créée avec succès:', response.data);
    
    // Récupérer l'utilisateur pour simuler l'owner
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Retourner la propriété avec l'owner
    return {
      ...response.data,
      owner: user, // Ajouter l'owner dans la réponse
      ownerId: user.id
    };
    
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
      // Fallback : filtrer les propriétés du mock pour l'utilisateur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const allProperties = this.getMockProperties();
      return allProperties.filter(p => p.ownerId === user.id);
    }
  }
};

export default propertyApi;