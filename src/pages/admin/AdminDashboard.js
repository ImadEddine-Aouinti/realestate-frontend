import React, { useMemo } from 'react';
import { PieChart } from './AdminComponents.js'; // ← AJOUTEZ .js
import { calculateGlobalStats } from './AdminUtils.js'; // ← AJOUTEZ .js

const AdminDashboard = ({ users, properties, favorites, formatDate, formatPrice, getRoleIcon, getStatusIcon, getPropertyStatusIcon }) => {
  const globalStats = useMemo(() => calculateGlobalStats(users, properties, favorites), [users, properties, favorites]);

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

  return (
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
          <PieChart data={propertyTypeChartData} title="Distribution par Type de Propriété" />
        </div>

        {/* Graphique des prix */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <PieChart data={priceChartData} title="Distribution par Tranche de Prix" />
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
  );
};

export default AdminDashboard;