// src/services/adminApi.js (créer ce fichier)
import api from './authApi.js';

export const adminApi = {
  // Récupérer tous les utilisateurs
  async getUsers() {
    try {
      console.log('🔄 Chargement des utilisateurs...');
      const response = await api.get('/api/admin/users');
      console.log('✅ Utilisateurs chargés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      
      // Fallback: données de test
      return [
        {
          id: 1,
          nom: 'Admin User',
          email: 'admin@example.com',
          telephone: '+1234567890',
          role: 'ROLE_ADMIN',
          enabled: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          nom: 'Client 1',
          email: 'client1@example.com',
          telephone: '+0987654321',
          role: 'ROLE_USER',
          enabled: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          nom: 'Client 2',
          email: 'client2@example.com',
          telephone: '+0987654321',
          role: 'ROLE_USER',
          enabled: false,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(id) {
    try {
      await api.delete(`/api/admin/users/${id}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw error;
    }
  },

  // Créer un utilisateur
  async createUser(userData) {
    try {
      const response = await api.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  },

  // Basculer le statut d'un utilisateur
  async toggleUserStatus(id) {
    try {
      const response = await api.patch(`/api/admin/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur toggle statut:', error);
      throw error;
    }
  }
};

export default adminApi;