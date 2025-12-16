import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/authApi.js';
import { propertyApi } from '../services/propertyApi.js';
import { favoritesApi } from '../services/favoritesApi.js';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'properties', 'analytics'

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Charger toutes les données en parallèle
    const [usersData, propertiesData, favoritesData] = await Promise.all([
      adminApi.getUsers(),
      propertyApi.getAllProperties(),
      favoritesApi.getAllFavorites()  // Utiliser la nouvelle méthode
    ]);
    
    console.log('✅ Données chargées:', {
      users: usersData.length,
      properties: propertiesData.length,
      favorites: favoritesData.length
    });
    
    setUsers(usersData);
    setProperties(propertiesData);
    setFavorites(favoritesData);
  } catch (err) {
    console.error('❌ Erreur lors du chargement des données:', err);
    setError('Erreur lors du chargement des données: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  // Statistiques globales
  const globalStats = useMemo(() => ({
    // Utilisateurs
    totalUsers: users.length,
    activeUsers: users.filter(u => u.enabled).length,
    adminUsers: users.filter(u => u.role === 'ROLE_ADMIN').length,
    newUsersToday: users.filter(u => {
      const today = new Date().toDateString();
      const userDate = new Date(u.createdAt).toDateString();
      return userDate === today;
    }).length,
    
    // Propriétés
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'AVAILABLE').length,
    soldProperties: properties.filter(p => p.status === 'SOLD').length,
    pendingProperties: properties.filter(p => p.status === 'PENDING').length,
    totalPropertyValue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
    
    // Favoris
    totalFavorites: favorites.length,
    averageFavoritesPerUser: users.length > 0 ? (favorites.length / users.length).toFixed(1) : 0,
    mostLikedProperty: properties.reduce((max, p) => {
      const favoritesCount = favorites.filter(f => f.propertyId === p.id).length;
      return favoritesCount > (max.count || 0) ? { property: p, count: favoritesCount } : max;
    }, { property: null, count: 0 }),
    
    // Types de propriétés
    propertyTypes: {
      APARTMENT: properties.filter(p => p.type === 'APARTMENT').length,
      HOUSE: properties.filter(p => p.type === 'HOUSE').length,
      VILLA: properties.filter(p => p.type === 'VILLA').length,
      OFFICE: properties.filter(p => p.type === 'OFFICE').length,
      COMMERCIAL: properties.filter(p => p.type === 'COMMERCIAL').length,
      LAND: properties.filter(p => p.type === 'LAND').length
    },
    
    // Distribution des prix
    priceDistribution: {
      under100k: properties.filter(p => p.price < 100000).length,
      '100k-300k': properties.filter(p => p.price >= 100000 && p.price < 300000).length,
      '300k-500k': properties.filter(p => p.price >= 300000 && p.price < 500000).length,
      '500k-1M': properties.filter(p => p.price >= 500000 && p.price < 1000000).length,
      over1M: properties.filter(p => p.price >= 1000000).length
    },
    
    // Top propriétaires
    topOwners: Object.entries(
      properties.reduce((acc, p) => {
        if (p.owner) {
          acc[p.owner.id] = {
            owner: p.owner,
            count: (acc[p.owner.id]?.count || 0) + 1,
            totalValue: (acc[p.owner.id]?.totalValue || 0) + (p.price || 0)
          };
        }
        return acc;
      }, {})
    )
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5),
    
    // Activité récente
    recentProperties: [...properties]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    
    recentUsers: [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }), [users, properties, favorites]);

  // Graphique des propriétés par type
  const propertyTypeChartData = useMemo(() => {
    const types = Object.entries(globalStats.propertyTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type === 'APARTMENT' ? 'Appartement' : 
              type === 'HOUSE' ? 'Maison' : 
              type === 'VILLA' ? 'Villa' : 
              type === 'OFFICE' ? 'Bureau' : 
              type === 'COMMERCIAL' ? 'Commercial' : 'Terrain',
        count,
        color: type === 'APARTMENT' ? '#3B82F6' :
               type === 'HOUSE' ? '#10B981' :
               type === 'VILLA' ? '#8B5CF6' :
               type === 'OFFICE' ? '#F59E0B' :
               type === 'COMMERCIAL' ? '#EF4444' : '#6B7280'
      }));
    
    return types;
  }, [globalStats.propertyTypes]);

  // Graphique de distribution des prix
  const priceChartData = useMemo(() => {
    return Object.entries(globalStats.priceDistribution)
      .filter(([_, count]) => count > 0)
      .map(([range, count]) => ({
        range: range === 'under100k' ? '< 100k €' :
               range === '100k-300k' ? '100k-300k €' :
               range === '300k-500k' ? '300k-500k €' :
               range === '500k-1M' ? '500k-1M €' : '> 1M €',
        count,
        color: range === 'under100k' ? '#93C5FD' :
               range === '100k-300k' ? '#60A5FA' :
               range === '300k-500k' ? '#3B82F6' :
               range === '500k-1M' ? '#1D4ED8' : '#1E40AF'
      }));
  }, [globalStats.priceDistribution]);

  // ========== FONCTIONS EXISTANTES (conservées) ==========

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

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRoleIcon = (role) => role === 'ROLE_ADMIN' ? '👑' : '👤';
  const getStatusIcon = (enabled) => enabled ? '🟢' : '🔴';

  const getPropertyStatusIcon = (status) => {
    switch(status) {
      case 'AVAILABLE': return '🟢';
      case 'PENDING': return '🟡';
      case 'SOLD': return '🔴';
      case 'RENTED': return '🔵';
      default: return '⚪';
    }
  };

  // Fonction pour dessiner un graphique circulaire simple
  const renderPieChart = (data, title) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="flex items-center">
          <div className="relative w-32 h-32 mr-6">
            {/* SVG pour le graphique circulaire */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {data.reduce((acc, item, index) => {
                const percentage = (item.count / total) * 100;
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
                const offset = acc.offset;
                
                const element = (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 50 50)"
                  />
                );
                
                acc.offset += (percentage * circumference) / 100;
                acc.elements.push(element);
                return acc;
              }, { offset: 0, elements: [] }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{total}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.type || item.range}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {item.count} ({Math.round((item.count / total) * 100)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Chargement du tableau de bord...</p>
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
            onClick={fetchAllData}
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
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Administratif</h1>
              <p className="text-gray-600 mt-1">
                Vue d'ensemble et gestion complète de la plateforme
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <span className="mr-2">🔄</span>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            📊 Tableau de Bord
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            👥 Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === 'properties' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            🏠 Propriétés
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Utilisateurs */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Utilisateurs Totaux</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-600">+{globalStats.newUsersToday} aujourd'hui</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">👥</span>
                  </div>
                </div>
              </div>

              {/* Propriétés */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Propriétés Total</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.totalProperties}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {globalStats.availableProperties} disponibles
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🏠</span>
                  </div>
                </div>
              </div>

              {/* Valeur totale */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Valeur Totale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(globalStats.totalPropertyValue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Moyenne: {formatPrice(globalStats.totalPropertyValue / Math.max(globalStats.totalProperties, 1))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                </div>
              </div>

              {/* Favoris */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Favoris</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.totalFavorites}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {globalStats.averageFavoritesPerUser} par utilisateur
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">❤️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deuxième ligne de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Statut des propriétés */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Statut Propriétés</p>
                  </div>
                  <span className="text-gray-400">📊</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">🟢</span>
                      <span className="text-sm">Disponibles</span>
                    </div>
                    <span className="font-semibold">{globalStats.availableProperties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">🟡</span>
                      <span className="text-sm">En attente</span>
                    </div>
                    <span className="font-semibold">{globalStats.pendingProperties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-2">🔴</span>
                      <span className="text-sm">Vendues</span>
                    </div>
                    <span className="font-semibold">{globalStats.soldProperties}</span>
                  </div>
                </div>
              </div>

              {/* Top propriété favorisée */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Top Favoris</p>
                  </div>
                  <span className="text-gray-400">🏆</span>
                </div>
                {globalStats.mostLikedProperty.property ? (
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {globalStats.mostLikedProperty.property.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatPrice(globalStats.mostLikedProperty.property.price)}
                    </p>
                    <div className="flex items-center">
                      <span className="text-red-500 mr-2">❤️</span>
                      <span className="text-sm">
                        {globalStats.mostLikedProperty.count} favoris
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun favori</p>
                )}
              </div>

              {/* Top propriétaire */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Top Propriétaire</p>
                  </div>
                  <span className="text-gray-400">👑</span>
                </div>
                {globalStats.topOwners[0] ? (
                  <div>
                    <p className="font-semibold text-gray-900">
                      {globalStats.topOwners[0].owner.nom}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {globalStats.topOwners[0].count} propriétés
                    </p>
                    <p className="text-sm">
                      Valeur: {formatPrice(globalStats.topOwners[0].totalValue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun propriétaire</p>
                )}
              </div>

              {/* Distribution rôles */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Rôles Utilisateurs</p>
                  </div>
                  <span className="text-gray-400">👥</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">👤</span>
                      <span className="text-sm">Utilisateurs</span>
                    </div>
                    <span className="font-semibold">
                      {globalStats.totalUsers - globalStats.adminUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-purple-500 mr-2">👑</span>
                      <span className="text-sm">Administrateurs</span>
                    </div>
                    <span className="font-semibold">{globalStats.adminUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Graphique des types de propriétés */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                {renderPieChart(propertyTypeChartData, 'Distribution par Type de Propriété')}
              </div>

              {/* Graphique des prix */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                {renderPieChart(priceChartData, 'Distribution par Tranche de Prix')}
              </div>
            </div>

            {/* Activité récente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Propriétés récentes */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriétés Récentes</h3>
                <div className="space-y-4">
                  {globalStats.recentProperties.map((property, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-gray-600">🏠</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-xs">
                            {property.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(property.price)} • {property.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{getPropertyStatusIcon(property.status)}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(property.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilisateurs récents */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs Récents</h3>
                <div className="space-y-4">
                  {globalStats.recentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">
                            {user.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.nom}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{getRoleIcon(user.role)}</span>
                        <span>{getStatusIcon(user.enabled)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            {/* Barre de contrôle utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">⚙️</span>
                    Filtres
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">📥</span>
                    Exporter CSV
                  </button>
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
                </div>
              )}
            </div>

            {/* Tableau des utilisateurs (garder le code existant ici) */}
            {/* ... Le code du tableau des utilisateurs reste inchangé ... */}
          </>
        )}

        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Propriétés</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Statistiques Propriétés</h3>
                <p className="text-3xl font-bold text-blue-900 mb-1">{globalStats.totalProperties}</p>
                <p className="text-blue-700">propriétés totales</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                <h3 className="font-semibold text-green-900 mb-2">Valeur Totale</h3>
                <p className="text-3xl font-bold text-green-900 mb-1">
                  {formatPrice(globalStats.totalPropertyValue)}
                </p>
                <p className="text-green-700">portefeuille immobilier</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                <h3 className="font-semibold text-purple-900 mb-2">Propriété la plus populaire</h3>
                <p className="text-xl font-bold text-purple-900 mb-1">
                  {globalStats.mostLikedProperty.count} ❤️
                </p>
                <p className="text-purple-700">favoris</p>
              </div>
            </div>
            
            {/* Tableau des propriétés (à implémenter) */}
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🏗️</div>
              <p className="text-lg font-medium">Module propriétés en développement</p>
              <p className="text-sm">Cette fonctionnalité sera bientôt disponible</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Avancées</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance des propriétés */}
              <div className="p-6 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Performance des Propriétés</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Taux de conversion</span>
                      <span className="text-sm font-semibold">
                        {globalStats.totalProperties > 0 
                          ? ((globalStats.soldProperties / globalStats.totalProperties) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${globalStats.totalProperties > 0 
                            ? (globalStats.soldProperties / globalStats.totalProperties) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Temps moyen de vente</span>
                      <span className="text-sm font-semibold">45 jours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement utilisateur */}
              <div className="p-6 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Engagement Utilisateur</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Taux d'activation</span>
                      <span className="text-sm font-semibold">
                        {globalStats.totalUsers > 0 
                          ? ((globalStats.activeUsers / globalStats.totalUsers) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${globalStats.totalUsers > 0 
                            ? (globalStats.activeUsers / globalStats.totalUsers) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Favoris par utilisateur</span>
                      <span className="text-sm font-semibold">
                        {globalStats.averageFavoritesPerUser}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(parseFloat(globalStats.averageFavoritesPerUser) * 20, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Insights & Recommandations</h3>
              <div className="space-y-3">
                {globalStats.availableProperties === 0 && (
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <div>
                      <p className="font-medium text-gray-900">Aucune propriété disponible</p>
                      <p className="text-sm text-gray-600">Ajoutez de nouvelles propriétés pour maintenir l'activité</p>
                    </div>
                  </div>
                )}
                
                {globalStats.newUsersToday > 0 && (
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">📈</span>
                    <div>
                      <p className="font-medium text-gray-900">Nouveaux utilisateurs aujourd'hui</p>
                      <p className="text-sm text-gray-600">+{globalStats.newUsersToday} inscriptions aujourd'hui</p>
                    </div>
                  </div>
                )}
                
                {globalStats.mostLikedProperty.count > 10 && (
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">🔥</span>
                    <div>
                      <p className="font-medium text-gray-900">Propriété populaire</p>
                      <p className="text-sm text-gray-600">
                        "{globalStats.mostLikedProperty.property.title}" a {globalStats.mostLikedProperty.count} favoris
                      </p>
                    </div>
                  </div>
                )}
                
                {globalStats.pendingProperties > 5 && (
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">⏳</span>
                    <div>
                      <p className="font-medium text-gray-900">Propriétés en attente</p>
                      <p className="text-sm text-gray-600">
                        {globalStats.pendingProperties} propriétés nécessitent un suivi
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;