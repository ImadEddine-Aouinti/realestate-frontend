import React, { useState, useEffect, useMemo } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone.includes(searchTerm);

      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = filters.status === '' || 
        (filters.status === 'active' && user.enabled) ||
        (filters.status === 'inactive' && !user.enabled);

      const userDate = new Date(user.createdAt);
      const matchesDateFrom = !filters.dateFrom || userDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || userDate <= new Date(filters.dateTo + 'T23:59:59');

      return matchesSearch && matchesRole && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [users, searchTerm, filters]);

  // Fonctions de tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  // Gestion de la sélection multiple
  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  // Actions groupées
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    const confirmMessage = {
      enable: 'Êtes-vous sûr de vouloir activer les utilisateurs sélectionnés ?',
      disable: 'Êtes-vous sûr de vouloir désactiver les utilisateurs sélectionnés ?',
      delete: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?'
    }[action];

    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === 'delete') {
        await Promise.all(selectedUsers.map(id => adminApi.deleteUser(id)));
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      } else if (action === 'enable' || action === 'disable') {
        const enabled = action === 'enable';
        await Promise.all(selectedUsers.map(id => adminApi.updateUser(id, { enabled })));
        setUsers(users.map(user =>
          selectedUsers.includes(user.id) ? { ...user, enabled } : user
        ));
      }
      
      setSelectedUsers([]);
    } catch (err) {
      console.error('Erreur lors de l\'action groupée:', err);
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  // Calcul des statistiques
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'ROLE_ADMIN').length,
    active: users.filter(u => u.enabled).length,
    inactive: users.filter(u => !u.enabled).length,
    today: users.filter(u => {
      const today = new Date().toDateString();
      const userDate = new Date(u.createdAt).toDateString();
      return userDate === today;
    }).length
  }), [users]);

  // Fonctions d'édition individuelle
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const updatedUser = await adminApi.updateUser(id, { enabled: !user.enabled });
      setUsers(users.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      alert('Erreur: ' + (err.response?.data?.message || err.message));
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
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date d\'inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.nom}"`,
        `"${user.email}"`,
        `"${user.telephone}"`,
        user.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur',
        user.enabled ? 'Actif' : 'Inactif',
        new Date(user.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatage des dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Icônes
  const getRoleIcon = (role) => role === 'ROLE_ADMIN' ? '👑' : '👤';
  const getStatusIcon = (enabled) => enabled ? '🟢' : '🔴';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration Utilisateurs</h1>
              <p className="text-gray-600 mt-1">
                Gérez l'ensemble des utilisateurs de votre plateforme
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">📥</span>
                Exporter CSV
              </button>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">🔄</span>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inactifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">⏸️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de contrôle */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Recherche */}
            <div className="lg:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
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

            {/* Filtres et Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">⚙️</span>
                Filtres
              </button>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} sélectionné(s)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('enable')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm"
                    >
                      Activer
                    </button>
                    <button
                      onClick={() => handleBulkAction('disable')}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors duration-200 text-sm"
                    >
                      Désactiver
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200 text-sm"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les rôles</option>
                    <option value="ROLE_ADMIN">Administrateur</option>
                    <option value="ROLE_USER">Utilisateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFilters({ role: '', status: '', dateFrom: '', dateTo: '' })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* En-tête du tableau */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Utilisateurs ({filteredUsers.length})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Afficher:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Corps du tableau */}
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(v => v) 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Commencez par ajouter des utilisateurs'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('nom')}
                      >
                        <div className="flex items-center">
                          Utilisateur
                          {sortConfig.key === 'nom' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">
                          Rôle
                          {sortConfig.key === 'role' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('enabled')}
                      >
                        <div className="flex items-center">
                          Statut
                          {sortConfig.key === 'enabled' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Inscription
                          {sortConfig.key === 'createdAt' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                        {/* Sélection */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                            className="rounded border-gray-300"
                          />
                        </td>

                        {/* Utilisateur */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.nom.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {editingUser === user.id ? (
                                  <input
                                    type="text"
                                    name="nom"
                                    value={editForm.nom}
                                    onChange={handleEditChange}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
                                  />
                                ) : user.nom}
                              </div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {editingUser === user.id ? (
                              <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full mb-2"
                              />
                            ) : (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-gray-400">📧</span>
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
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400">📱</span>
                                <span>{user.telephone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Rôle */}
                        <td className="px-6 py-4">
                          {editingUser === user.id ? (
                            <select
                              name="role"
                              value={editForm.role}
                              onChange={handleEditChange}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="ROLE_USER">Utilisateur</option>
                              <option value="ROLE_ADMIN">Administrateur</option>
                            </select>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>{getRoleIcon(user.role)}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'ROLE_ADMIN' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span>{getStatusIcon(user.enabled)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.enabled ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </td>

                        {/* Date d'inscription */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span>📅</span>
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingUser === user.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateUser(user.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 text-xs"
                              >
                                💾 Sauvegarder
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200 text-xs"
                              >
                                ↩️ Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id)}
                                className={`p-2 rounded transition-colors duration-200 ${
                                  user.enabled 
                                    ? 'text-orange-600 hover:bg-orange-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={user.enabled ? 'Désactiver' : 'Activer'}
                              >
                                {user.enabled ? '⏸️' : '▶️'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-gray-700 mb-4 md:mb-0">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                    </span> sur{' '}
                    <span className="font-medium">{filteredUsers.length}</span> résultats
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ← Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Résumé */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600">✏️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Modification</p>
                  <p className="text-sm text-gray-600">Cliquez sur l'icône ✏️ pour éditer un utilisateur</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600">✅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sélection multiple</p>
                  <p className="text-sm text-gray-600">Utilisez les cases à cocher pour les actions groupées</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600">📥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Export</p>
                  <p className="text-sm text-gray-600">Exportez les données au format CSV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;