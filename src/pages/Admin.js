import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/authApi.js';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    role: 'ROLE_USER',
    enabled: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔄 Chargement des utilisateurs...');
      const usersData = await adminApi.getUsers();
      console.log('✅ Utilisateurs reçus:', usersData);
      
      setUsers(usersData);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      console.log('✅ Utilisateur supprimé:', id);
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedUser = await adminApi.toggleUserStatus(id);
      setUsers(users.map(user => 
        user.id === id ? { ...user, enabled: updatedUser.enabled } : user
      ));
      console.log('✅ Statut modifié pour:', id);
    } catch (err) {
      console.error('❌ Erreur lors du changement de statut:', err);
      alert('Erreur lors du changement de statut: ' + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      enabled: user.enabled
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      nom: '',
      email: '',
      telephone: '',
      role: 'ROLE_USER',
      enabled: true
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleUpdateUser = async (id) => {
    try {
      const updatedUser = await adminApi.updateUser(id, editForm);
      setUsers(users.map(user => 
        user.id === id ? updatedUser : user
      ));
      setEditingUser(null);
      console.log('✅ Utilisateur modifié:', id);
    } catch (err) {
      console.error('❌ Erreur lors de la modification:', err);
      alert('Erreur lors de la modification: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telephone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Chargement des utilisateurs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">⚠️</span>
            <strong className="text-lg">Erreur:</strong>
          </div>
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👑 Administration
              </h1>
              <p className="text-gray-600 text-lg">
                Gestion des utilisateurs - {filteredUsers.length} utilisateur(s) trouvé(s)
              </p>
            </div>
            
            {/* Barre de recherche */}
            <div className="mt-4 lg:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carte des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'ROLE_ADMIN').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.enabled).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilisateurs Inactifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => !user.enabled).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">❌</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                📋 Liste des Utilisateurs
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredUsers.length} résultat(s)
              </span>
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
              <p className="text-gray-400 mt-2">
                {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Aucun utilisateur dans la base de données'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Nom */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {user.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {editingUser === user.id ? (
                                <input
                                  type="text"
                                  name="nom"
                                  value={editForm.nom}
                                  onChange={handleEditChange}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                user.nom
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {editingUser === user.id ? (
                            <input
                              type="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-1 mb-1">
                              <span>📧</span>
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {editingUser === user.id ? (
                            <input
                              type="tel"
                              name="telephone"
                              value={editForm.telephone}
                              onChange={handleEditChange}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span>📞</span>
                              <span>{user.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <select
                            name="role"
                            value={editForm.role}
                            onChange={handleEditChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ROLE_USER">👤 Client</option>
                            <option value="ROLE_ADMIN">👑 Administrateur</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'ROLE_ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 Client'}
                          </span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.enabled ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </td>

                      {/* Date d'inscription */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUser === user.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateUser(user.id)}
                              className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
                              title="Sauvegarder les modifications"
                            >
                              <span>💾</span>
                              <span className="text-xs">Sauvegarder</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                              title="Annuler les modifications"
                            >
                              <span>↩️</span>
                              <span className="text-xs">Annuler</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            {/* Bouton Modifier */}
                            <button
                              onClick={() => startEdit(user)}
                              className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 group"
                              title="Modifier cet utilisateur"
                            >
                              <span>✏️</span>
                              <span className="text-xs">Modifier</span>
                            </button>

                            {/* Bouton Activer/Désactiver */}
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group ${
                                user.enabled 
                                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                              title={user.enabled ? 'Désactiver cet utilisateur' : 'Activer cet utilisateur'}
                            >
                              <span>{user.enabled ? '⏸️' : '▶️'}</span>
                              <span className="text-xs">
                                {user.enabled ? 'Désactiver' : 'Activer'}
                              </span>
                            </button>

                            {/* Bouton Supprimer */}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 group"
                              title="Supprimer cet utilisateur"
                            >
                              <span>🗑️</span>
                              <span className="text-xs">Supprimer</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Légende des actions */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Légende des Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✏️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Modifier</p>
                <p className="text-sm text-gray-500">Éditer les informations de l'utilisateur</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⏸️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Désactiver</p>
                <p className="text-sm text-gray-500">Rendre l'utilisateur inactif</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">▶️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Activer</p>
                <p className="text-sm text-gray-500">Rendre l'utilisateur actif</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🗑️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Supprimer</p>
                <p className="text-sm text-gray-500">Supprimer définitivement l'utilisateur</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💾</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Sauvegarder</p>
                <p className="text-sm text-gray-500">Enregistrer les modifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">↩️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Annuler</p>
                <p className="text-sm text-gray-500">Annuler l'édition en cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;