import React from 'react';

// Composant PieChart
export const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="p-4">
      <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="flex items-center">
        <div className="relative w-32 h-32 mr-6">
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

// Composant UserTable
export const UserTable = ({
  users,
  editingUser,
  editForm,
  selectedUsers,
  sortConfig,
  currentPage,
  totalPages,
  itemsPerPage,
  onSort,
  onSelectUser,
  onSelectAll,
  onBulkAction,
  onDeleteUser,
  onToggleStatus,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onUpdateUser,
  onPageChange,
  onItemsPerPageChange,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Barre d'actions groupées */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-700 font-medium mr-3">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <button
                onClick={() => onBulkAction('enable')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200 mr-2"
              >
                🟢 Activer
              </button>
              <button
                onClick={() => onBulkAction('disable')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200 mr-2"
              >
                🔴 Désactiver
              </button>
              <button
                onClick={() => onBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
              >
                🗑️ Supprimer
              </button>
            </div>
            <button
              onClick={() => onSelectAll([])}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <button onClick={() => onSort('nom')} className="flex items-center">
                  Nom {sortConfig.key === 'nom' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <button onClick={() => onSort('role')} className="flex items-center">
                  Rôle {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <button onClick={() => onSort('enabled')} className="flex items-center">
                  Statut {sortConfig.key === 'enabled' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <button onClick={() => onSort('createdAt')} className="flex items-center">
                  Date d'inscription {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="nom"
                      value={editForm.nom}
                      onChange={onEditChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{user.nom}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={onEditChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div className="text-gray-600">{user.email}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={onEditChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    >
                      <option value="ROLE_USER">Utilisateur</option>
                      <option value="ROLE_ADMIN">Administrateur</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ROLE_ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 User'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === user.id ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={editForm.enabled}
                        onChange={onEditChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Actif</span>
                    </label>
                  ) : (
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.enabled ? '🟢 Actif' : '🔴 Inactif'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {editingUser === user.id ? (
                      <>
                        <button
                          onClick={() => onUpdateUser(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                        >
                          ✓
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onStartEdit(user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 par page</option>
              <option value={10}>10 par page</option>
              <option value={20}>20 par page</option>
              <option value={50}>50 par page</option>
            </select>
            <span className="text-sm text-gray-600">
              Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, users.length)} à {Math.min(currentPage * itemsPerPage, users.length)} sur {users.length} utilisateurs
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
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
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2">...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// SUPPRIMEZ CETTE LIGNE si elle existe :
// export default { PieChart, UserTable }; ← NE PAS EXPORTER COMME OBJET