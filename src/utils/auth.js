// Gestion de l'authentification dans le localStorage
export const authUtils = {
  // Sauvegarder les infos utilisateur
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Récupérer l'utilisateur
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: () => {
    const user = authUtils.getUser();
    return user && user.role === 'ROLE_ADMIN';
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export default authUtils;