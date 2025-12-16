import React, { useState, useMemo } from 'react';
import { adminApi } from '../../services/authApi.js';
import { UserTable } from './AdminComponents.js';

const AdminUsers = ({ users, onDataUpdate, formatDate }) => {
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
  
  // États pour les modales de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Fonction pour afficher une confirmation modale
  const showConfirmation = (action, data = {}) => {
    setConfirmAction(action);
    setConfirmData(data);
    setShowConfirmModal(true);
  };

  // Fonction pour afficher une erreur modale
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    const messages = {
      enable: {
        title: 'Activer les utilisateurs',
        message: `Êtes-vous sûr de vouloir activer ${selectedUsers.length} utilisateur(s) sélectionné(s) ?`,
        confirmText: 'Activer',
        cancelText: 'Annuler',
        icon: '🟢'
      },
      disable: {
        title: 'Désactiver les utilisateurs',
        message: `Êtes-vous sûr de vouloir désactiver ${selectedUsers.length} utilisateur(s) sélectionné(s) ?`,
        confirmText: 'Désactiver',
        cancelText: 'Annuler',
        icon: '🔴'
      },
      delete: {
        title: 'Supprimer les utilisateurs',
        message: `Êtes-vous sûr de vouloir supprimer définitivement ${selectedUsers.length} utilisateur(s) sélectionné(s) ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        icon: '🗑️'
      }
    };

    showConfirmation(action, messages[action]);
  };

  // Exécuter l'action après confirmation
  const executeBulkAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await Promise.all(selectedUsers.map(id => adminApi.deleteUser(id)));
        onDataUpdate('users', users.filter(user => !selectedUsers.includes(user.id)));
      } else if (confirmAction === 'enable' || confirmAction === 'disable') {
        const enabled = confirmAction === 'enable';
        await Promise.all(selectedUsers.map(id => adminApi.updateUser(id, { enabled })));
        onDataUpdate('users', users.map(user =>
          selectedUsers.includes(user.id) ? { ...user, enabled } : user
        ));
      }
      
      setSelectedUsers([]);
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'action groupée:', err);
      showError('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (id) => {
    const user = users.find(u => u.id === id);
    showConfirmation('deleteSingle', {
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.nom}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      icon: '🗑️',
      userId: id
    });
  };

  // Exécuter la suppression d'un seul utilisateur
  const executeDeleteUser = async () => {
    try {
      await adminApi.deleteUser(confirmData.userId);
      onDataUpdate('users', users.filter(user => user.id !== confirmData.userId));
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      showError('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const newStatus = !user.enabled;
      
      showConfirmation('toggleStatus', {
        title: newStatus ? 'Activer l\'utilisateur' : 'Désactiver l\'utilisateur',
        message: `Êtes-vous sûr de vouloir ${newStatus ? 'activer' : 'désactiver'} l'utilisateur "${user.nom}" ?`,
        confirmText: newStatus ? 'Activer' : 'Désactiver',
        cancelText: 'Annuler',
        icon: newStatus ? '🟢' : '🔴',
        userId: id,
        newStatus: newStatus
      });
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      showError('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  // Exécuter le changement de statut
  const executeToggleStatus = async () => {
    try {
      const user = users.find(u => u.id === confirmData.userId);
      const updatedUser = await adminApi.updateUser(confirmData.userId, { enabled: confirmData.newStatus });
      onDataUpdate('users', users.map(u => u.id === confirmData.userId ? updatedUser : u));
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      showError('Erreur: ' + (err.response?.data?.message || err.message));
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
      onDataUpdate('users', users.map(user => 
        user.id === id ? updatedUser : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      showError('Erreur: ' + (err.response?.data?.message || err.message));
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

  // Gérer l'exécution de l'action confirmée
  const handleConfirm = async () => {
    switch (confirmAction) {
      case 'enable':
      case 'disable':
      case 'delete':
        await executeBulkAction();
        break;
      case 'deleteSingle':
        await executeDeleteUser();
        break;
      case 'toggleStatus':
        await executeToggleStatus();
        break;
      default:
        setShowConfirmModal(false);
    }
  };

  return (
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

      {/* Tableau des utilisateurs */}
      <UserTable
        users={paginatedUsers}
        editingUser={editingUser}
        editForm={editForm}
        selectedUsers={selectedUsers}
        sortConfig={sortConfig}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onSort={handleSort}
        onSelectUser={toggleSelectUser}
        onSelectAll={toggleSelectAll}
        onBulkAction={handleBulkAction}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onEditChange={handleEditChange}
        onUpdateUser={handleUpdateUser}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        formatDate={formatDate}
      />

      {/* Modale de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-600 text-2xl">
                {confirmData.icon || '⚠️'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {confirmData.title || 'Confirmation'}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {confirmData.message}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  {confirmData.cancelText || 'Annuler'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-3 font-medium rounded-xl transition-all duration-200 ${
                    confirmAction === 'delete' || confirmAction === 'deleteSingle'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : confirmAction === 'disable'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {confirmData.confirmText || 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-600 text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Erreur
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {errorMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;