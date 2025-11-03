import React, { useState, useEffect } from 'react';
import { authApi } from '../services/authApi.js';
import { authUtils } from '../utils/auth.js';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
      setFormData({
        nom: userData.nom,
        telephone: userData.telephone,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authApi.updateProfile(formData);
      setUser(response.data);
      setMessage('✅ Profil mis à jour avec succès!');
      
      const currentUser = authUtils.getUser();
      authUtils.setAuth(authUtils.getToken(), { ...currentUser, nom: response.data.nom });
    } catch (error) {
      setMessage('❌ Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Bannière profil */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-24 relative">
            <div className="absolute -bottom-8 left-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <div className="pt-12 px-8 pb-8">
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-500 mb-1">Rôle</label>
                <p className="text-gray-900 font-medium">
                  {user.role === 'ROLE_ADMIN' ? '👑 Administrateur' : '👤 Client'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-500 mb-1">Date d'inscription</label>
                <p className="text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-500 mb-1">Statut</label>
                <p className="text-gray-900 font-medium">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    ✅ Actif
                  </span>
                </p>
              </div>
            </div>

            {/* Formulaire de modification */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="nom"
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                  📞 Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  id="telephone"
                  required
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </div>
                ) : (
                  '💾 Mettre à jour le profil'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;