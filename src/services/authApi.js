import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log des requêtes
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur request:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status} ${error.config?.url}:`, {
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Token expiré, déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Connexion
  async login(credentials) {
    try {
      console.log('📤 Envoi des credentials:', credentials);
      
      const response = await api.post('/auth/login', credentials);
      console.log('📥 Réponse reçue:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login API:', error.response?.data || error.message);
      throw error;
    }
  },

  // Inscription
  async register(userData) {
    try {
      console.log('📤 Envoi inscription:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('📥 Réponse inscription:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur register API:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Récupérer le profil
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  // Modifier le profil
  async updateProfile(profileData) {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },
};

export const adminApi = {
  // Récupérer tous les users (Admin seulement)
  async getUsers() {
    try {
      console.log('📤 Fetching users from admin API...');
      const response = await api.get('/admin/users');
      console.log('📥 Admin users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur admin API:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Modifier un user (Admin seulement)
  async updateUser(id, userData) {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  
  // Supprimer un user (Admin seulement)
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  // Activer/désactiver un user (Admin seulement)
  async toggleUserStatus(id) {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },
};

export default api;