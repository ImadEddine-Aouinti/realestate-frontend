import React from 'react';
import { calculateGlobalStats } from './AdminUtils.js'; // ← AJOUTEZ .js

const AdminAnalytics = ({ users, properties, favorites, formatPrice }) => {
  const globalStats = calculateGlobalStats(users, properties, favorites);

  return (
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
                  "{globalStats.mostLikedProperty.property?.title}" a {globalStats.mostLikedProperty.count} favoris
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
  );
};

export default AdminAnalytics;