import React, { useState, useEffect } from 'react';
import { fetchAllData, formatDate, formatPrice, getRoleIcon, getStatusIcon, getPropertyStatusIcon } from './AdminUtils.js';
import AdminDashboard from './AdminDashboard.js';
import AdminUsers from './AdminUsers.js';
import AdminProperties from './AdminProperties.js';
import AdminAnalytics from './AdminAnalytics.js';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await fetchAllData(setLoading, setError);
    if (result) {
      setUsers(result.users);
      setProperties(result.properties);
      setFavorites(result.favorites);
    }
  };

  const handleDataUpdate = (dataType, newData) => {
    switch (dataType) {
      case 'users':
        setUsers(newData);
        break;
      case 'properties':
        setProperties(newData);
        break;
      case 'favorites':
        setFavorites(newData);
        break;
      default:
        break;
    }
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
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const commonProps = {
    users,
    properties,
    favorites,
    onDataUpdate: handleDataUpdate,
    formatDate,
    formatPrice,
    getRoleIcon,
    getStatusIcon,
    getPropertyStatusIcon
  };

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
                onClick={loadData}
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
        {activeTab === 'dashboard' && <AdminDashboard {...commonProps} />}
        {activeTab === 'users' && <AdminUsers {...commonProps} />}
        {activeTab === 'properties' && <AdminProperties {...commonProps} />}
        {activeTab === 'analytics' && <AdminAnalytics {...commonProps} />}
      </div>
    </div>
  );
};

export default Admin;