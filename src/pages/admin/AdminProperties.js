import React from 'react';
import { calculateGlobalStats } from './AdminUtils.js'; // ← AJOUTEZ .js

const AdminProperties = ({ users, properties, favorites, formatPrice }) => {
  const globalStats = calculateGlobalStats(users, properties, favorites);

  return (
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
  );
};

export default AdminProperties;