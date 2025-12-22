// imageUploadApi.js
import api from './authApi.js';


const imageUploadApi = {
  /**
   * Upload multiple images for a property
   * @param {number} propertyId - Property ID
   * @param {File[]} files - Array of image files
   * @param {number} mainImageIndex - Index of main image
   * @returns {Promise} Uploaded images data
   */
  uploadImages: async (propertyId, files, mainImageIndex = 0) => {
    console.log(`📤 Upload de ${files.length} images pour propriété ${propertyId}`);
    
    const formData = new FormData();
    
    // Ajouter chaque fichier
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Ajouter l'index de l'image principale
    formData.append('mainImageIndex', mainImageIndex.toString());
    
    console.log('📦 FormData préparé:', {
      propertyId,
      fileCount: files.length,
      mainImageIndex
    });
    
    try {
      const response = await api.post(
        `/api/images/upload/${propertyId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Images uploadées avec succès:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur upload images:', error);
      
      let errorMessage = 'Erreur lors de l\'upload des images';
      
      if (error.response) {
        console.error('📡 Réponse erreur:', error.response.data);
        console.error('📡 Statut:', error.response.status);
        
        if (error.response.data) {
          errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        console.error('📡 Pas de réponse:', error.request);
        errorMessage = 'Impossible de se connecter au serveur';
      } else {
        console.error('📡 Erreur:', error.message);
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all images for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise} Array of images
   */
  getPropertyImages: async (propertyId) => {
    try {
      const response = await api.get(`/api/images/property/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération images:', error);
      throw error;
    }
  },

  /**
   * Delete an image
   * @param {number} imageId - Image ID
   * @returns {Promise} Success status
   */
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/api/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur suppression image:', error);
      throw error;
    }
  },

  /**
   * Set image as main
   * @param {number} imageId - Image ID
   * @returns {Promise} Success status
   */
  setAsMainImage: async (imageId) => {
    try {
      const response = await api.put(`/api/images/${imageId}/set-main`);
      return response.data;
    } catch (error) {
      console.error('Erreur set main image:', error);
      throw error;
    }
  }
};

export default imageUploadApi;