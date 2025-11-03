import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi.js';
import { authUtils } from '../utils/auth.js';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Très faible';
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Fort';
      case 4: return 'Très fort';
      default: return '';
    }
  };

  const validatePhoneNumber = (phone) => {
    // Validation basique du numéro de téléphone
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des champs
    if (formData.password !== formData.confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('❌ Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (!formData.telephone) {
      setError('❌ Le numéro de téléphone est obligatoire');
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.telephone)) {
      setError('❌ Format de numéro de téléphone invalide');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Début de l\'inscription...');
      console.log('📝 Données envoyées:', {
        ...formData,
        password: '***' // Masquer le mot de passe dans les logs
      });
      
      // 1. Création du compte avec le numéro de téléphone
      const registerResponse = await authApi.register(formData);
      console.log('✅ Réponse inscription:', registerResponse);

      // 2. CONNEXION AUTOMATIQUE APRÈS INSCRIPTION
      console.log('🔐 Tentative de connexion automatique...');
      const loginResponse = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Réponse connexion:', loginResponse);

      if (loginResponse.token) {
        const userData = {
          id: loginResponse.id,
          email: loginResponse.email,
          role: loginResponse.role,
          nom: loginResponse.nom || formData.nom,
          telephone: loginResponse.telephone || formData.telephone
        };
        
        console.log('💾 Stockage des données utilisateur:', userData);
        
        // Sauvegarde du token et des données utilisateur
        authUtils.setAuth(loginResponse.token, userData);
        
        // Vérification que l'utilisateur est bien connecté
        const isLoggedIn = authUtils.isAuthenticated();
        console.log('👤 Utilisateur connecté:', isLoggedIn);
        console.log('📱 Données utilisateur:', authUtils.getUser());
        
        // Message de succès
        setError('✅ Compte créé avec succès! Connexion...');
        
        // Redirection après un petit délai
        setTimeout(() => {
          if (loginResponse.role === 'ROLE_ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1500);
        
      } else {
        throw new Error('Token manquant après la connexion automatique');
      }
      
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      
      // Gestion d'erreur améliorée
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Si l'inscription réussit mais la connexion échoue
      if (errorMessage.includes('Token manquant')) {
        setError('✅ Compte créé! Veuillez vous connecter manuellement.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('❌ ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl text-white">👋</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Créer un compte
            </h2>
            <p className="text-gray-600 mt-2">
              Rejoignez RealEstate Pro
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 rounded-xl flex items-center space-x-2 animate-pulse ${
                error.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <span className="text-lg">{error.includes('✅') ? '🎉' : '⚠️'}</span>
                <span className="font-medium">{error.replace('✅ ', '').replace('❌ ', '')}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Champ Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Nom complet *
                </label>
                <input
                  name="nom"
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                  placeholder="Votre nom complet"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>

              {/* Champ Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Adresse email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Champ Téléphone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📞 Numéro de téléphone *
                </label>
                <input
                  name="telephone"
                  type="tel"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                  placeholder="+33 1 23 45 67 89"
                  value={formData.telephone}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +33 1 23 45 67 89 ou 0123456789
                </p>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Mot de passe *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Force du mot de passe:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength === 0 ? 'text-gray-500' :
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-orange-500' :
                        passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✅ Confirmer le mot de passe *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-green-600 text-xs font-medium flex items-center space-x-1">
                        <span>✅</span>
                        <span>Les mots de passe correspondent</span>
                      </span>
                    ) : (
                      <span className="text-red-600 text-xs font-medium flex items-center space-x-1">
                        <span>❌</span>
                        <span>Les mots de passe ne correspondent pas</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Informations obligatoires */}
            <div className="text-xs text-gray-500">
              * Champs obligatoires
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création et connexion...</span>
                </div>
              ) : (
                '🚀 Créer mon compte et me connecter'
              )}
            </button>

            {/* Lien vers connexion */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Information connexion automatique */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-lg">⚡</span>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Connexion automatique
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Vous serez connecté automatiquement après l'inscription
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;