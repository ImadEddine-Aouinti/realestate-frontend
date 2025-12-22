import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi.js';
import imageUploadApi from '../services/imageUploadApi.js';

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: '',
    status: 'AVAILABLE',
    surface: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Maroc',
    hasParking: false,
    hasGarden: false,
    hasPool: false,
    hasBalcony: false,
    hasElevator: false,
    hasAirConditioning: false,
    hasHeating: false,
    additionalFeatures: ''
  });
  
  // États pour les images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  // États UI
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Vérifier si le formulaire a été modifié
  useEffect(() => {
    const initialFormData = {
      title: '',
      description: '',
      price: '',
      type: '',
      status: 'AVAILABLE',
      surface: '',
      bedrooms: '',
      bathrooms: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Maroc',
      hasParking: false,
      hasGarden: false,
      hasPool: false,
      hasBalcony: false,
      hasElevator: false,
      hasAirConditioning: false,
      hasHeating: false,
      additionalFeatures: ''
    };

    const isFormChanged = 
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      images.length > 0 ||
      imageFiles.length > 0;

    setIsFormDirty(isFormChanged);
  }, [formData, images, imageFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion des images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limiter à 10 images maximum
    if (files.length + imageFiles.length > 10) {
      showNotification('error', 'Maximum 10 images autorisées');
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    const newImages = [...images];

    files.forEach((file, index) => {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', `L'image ${file.name} dépasse 5MB`);
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        showNotification('error', `Le fichier ${file.name} n'est pas une image`);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      newImageFiles.push(file);
      newImageUrls.push(imageUrl);
      
      newImages.push({
        url: '',
        altText: file.name,
        isMain: newImages.length === 0 && index === 0
      });
    });

    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    setImages(newImages);
    
    if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
      newImages[0].isMain = true;
      setMainImageIndex(0);
    }
  };

  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    const newImages = [...images];
    
    // Libérer l'URL de l'image
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);
    newImages.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    setImages(newImages);
    
    if (index === mainImageIndex && newImages.length > 0) {
      newImages[0].isMain = true;
      setMainImageIndex(0);
    } else if (newImages.length === 0) {
      setMainImageIndex(0);
    }
  };

  const handleSetMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    
    setImages(newImages);
    setMainImageIndex(index);
    showNotification('success', 'Image principale définie');
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    if (e.dataTransfer.files.length) {
      const fileList = e.dataTransfer.files;
      const event = { target: { files: fileList } };
      handleImageUpload(event);
    }
  };

  const showNotification = (type, message) => {
    // Création de la notification
    const notification = document.createElement('div');
    
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-700',
      error: 'bg-red-50 border-red-200 text-red-700',
      info: 'bg-blue-50 border-blue-200 text-blue-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border ${colors[type]} shadow-lg max-w-md animate-fadeInUp`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0 text-lg">${icons[type]}</div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 transition-colors">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('animate-fadeOutUp');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showNotification('error', 'Le titre est obligatoire');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showNotification('error', 'Veuillez entrer un prix valide');
      return false;
    }
    
    if (!formData.type) {
      showNotification('error', 'Veuillez sélectionner un type de propriété');
      return false;
    }
    
    if (!formData.address.trim()) {
      showNotification('error', 'L\'adresse est obligatoire');
      return false;
    }
    
    if (!formData.city.trim()) {
      showNotification('error', 'La ville est obligatoire');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('=== ÉTAPE 1: CRÉATION DE LA PROPRIÉTÉ ===');
      
      // 1. Créer la propriété SANS images
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        type: formData.type,
        status: formData.status,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        rooms: formData.bedrooms ? parseInt(formData.bedrooms) + 1 : null,
        yearBuilt: null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country,
        hasParking: formData.hasParking,
        hasGarden: formData.hasGarden,
        hasPool: formData.hasPool,
        hasBalcony: formData.hasBalcony,
        hasElevator: formData.hasElevator,
        hasAirConditioning: formData.hasAirConditioning,
        hasHeating: formData.hasHeating,
        additionalFeatures: formData.additionalFeatures.trim()
        // NE PAS inclure images ici
      };

      console.log('📤 Création propriété:', propertyData);
      
      // 2. Créer la propriété dans la base de données
      const createdProperty = await propertyApi.createProperty(propertyData);
      
      console.log('✅ Propriété créée ID:', createdProperty.id);
      console.log('📋 Propriété créée:', createdProperty);
      
      // 3. Uploader les images si elles existent
      if (imageFiles.length > 0) {
        console.log('=== ÉTAPE 2: UPLOAD DES IMAGES ===');
        console.log(`📤 ${imageFiles.length} images à uploader`);
        console.log('⭐ Image principale index:', mainImageIndex);
        
        setUploadingImages(true);
        
        try {
          // Préparer les images avec les informations
          const imagesToUpload = images.map((img, index) => ({
            ...img,
            isMain: index === mainImageIndex
          }));

          console.log('🖼️ Informations images:', imagesToUpload);
          
          // Uploader les images vers le serveur
          const uploadedImages = await imageUploadApi.uploadImages(
            createdProperty.id,
            imageFiles,
            mainImageIndex
          );
          
          console.log('✅ Images uploadées avec succès:', uploadedImages);
          
          showNotification('success', 'Propriété et images ajoutées avec succès !');
          
        } catch (uploadError) {
          console.error('❌ Erreur upload images:', uploadError);
          
          let errorMessage = 'Erreur lors de l\'upload des images';
          
          if (uploadError.response) {
            console.error('📡 Statut:', uploadError.response.status);
            console.error('📡 Données:', uploadError.response.data);
            
            if (uploadError.response.status === 404) {
              errorMessage = 'Endpoint d\'upload non trouvé. Vérifiez la configuration du serveur.';
            } else if (uploadError.response.status === 413) {
              errorMessage = 'Fichiers trop volumineux. Maximum 10MB par fichier.';
            } else if (uploadError.response.status === 415) {
              errorMessage = 'Type de fichier non supporté. Utilisez JPG, PNG ou GIF.';
            } else if (uploadError.response.data) {
              errorMessage = uploadError.response.data.message || errorMessage;
            }
          }
          
          showNotification(
            'warning', 
            `${errorMessage}. La propriété a été créée sans images.`
          );
        } finally {
          setUploadingImages(false);
        }
      } else {
        console.log('ℹ️ Aucune image à uploader');
        showNotification('success', 'Propriété ajoutée avec succès !');
      }
      
      // 4. Réinitialiser le formulaire
      console.log('=== ÉTAPE 3: RÉINITIALISATION ===');
      resetForm();
      
      // 5. Redirection après 2 secondes
      setTimeout(() => {
        navigate('/my-properties');
      }, 2000);
      
    } catch (err) {
      console.error('❌ ERREUR GLOBALE:', err);
      
      let errorMsg = 'Erreur lors de l\'ajout de la propriété';
      
      if (err.response) {
        console.error('📡 Statut:', err.response.status);
        console.error('📡 Données:', err.response.data);
        
        if (err.response.status === 401) {
          errorMsg = 'Vous devez être connecté pour ajouter une propriété';
        } else if (err.response.status === 403) {
          errorMsg = 'Vous n\'avez pas la permission d\'ajouter une propriété';
        } else if (err.response.data) {
          errorMsg = typeof err.response.data === 'string' 
            ? err.response.data 
            : err.response.data.message || errorMsg;
        }
      } else if (err.request) {
        console.error('📡 Pas de réponse:', err.request);
        errorMsg = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else {
        console.error('📡 Erreur:', err.message);
        errorMsg = err.message;
      }
      
      showNotification('error', errorMsg);
      setError(errorMsg);
      
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      type: '',
      status: 'AVAILABLE',
      surface: '',
      bedrooms: '',
      bathrooms: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Maroc',
      hasParking: false,
      hasGarden: false,
      hasPool: false,
      hasBalcony: false,
      hasElevator: false,
      hasAirConditioning: false,
      hasHeating: false,
      additionalFeatures: ''
    });
    
    // Libérer les URLs
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImageFiles([]);
    setImageUrls([]);
    setMainImageIndex(0);
    setIsFormDirty(false);
  };

  const handleCancel = () => {
    if (isFormDirty) {
      setShowExitModal(true);
    } else {
      navigate(-1);
    }
  };

  const handleExitConfirm = () => {
    // Libérer les URLs des images
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setShowExitModal(false);
    navigate(-1);
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  // Ajout d'un état de chargement pour les images
  const loadingMessage = loading 
    ? uploadingImages 
      ? 'Upload des images en cours...' 
      : 'Création de la propriété...'
    : 'Publier la propriété';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      {/* Modal de confirmation de sortie */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleExitCancel}
            ></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">
                      Quitter sans sauvegarder ?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?
                      </p>
                      <p className="text-sm text-yellow-600 mt-2 font-medium">
                        ⚠️ Toutes les modifications seront perdues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleExitConfirm}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-base font-medium text-white hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Oui, quitter
                </button>
                <button
                  type="button"
                  onClick={handleExitCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Continuer l'édition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header avec navigation */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Ajouter une propriété
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Remplissez les informations de votre propriété
                  </p>
                </div>
                
                {/* Indicateur de progression */}
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      1
                    </div>
                    <div className="w-16 h-1 bg-blue-200 mx-2"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-semibold">
                      2
                    </div>
                    <div className="w-16 h-1 bg-gray-200 mx-2"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-semibold">
                      3
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Informations de base */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                      🏠
                    </span>
                    Informations principales
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Titre de l'annonce *
                        <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Obligatoire</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ex: Magnifique villa moderne avec piscine"
                      />
                      <p className="text-xs text-gray-500 mt-1">Soyez descriptif pour attirer plus d'attention</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Décrivez votre propriété en détail..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Galerie d'images */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                      📷
                    </span>
                    Galerie d'images
                    {images.length > 0 && (
                      <span className="ml-3 text-sm font-normal text-gray-500">
                        ({images.length}/10 images)
                      </span>
                    )}
                  </h2>
                  
                  {/* Zone de drop */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer mb-6"
                    onClick={triggerFileInput}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <div className="text-4xl mb-2">📤</div>
                      <div className="text-lg font-medium text-gray-700">
                        Glissez vos images ici ou cliquez pour sélectionner
                      </div>
                      <p className="text-sm text-gray-500">
                        Formats supportés: JPG, PNG, GIF (max 5MB par image)
                      </p>
                      <p className="text-xs text-gray-400">
                        Maximum 10 images - La première sera l'image principale
                      </p>
                    </div>
                  </div>

                  {/* Prévisualisation des images */}
                  {images.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-700">
                          Aperçu des images
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setImages([]);
                            setImageFiles([]);
                            imageUrls.forEach(url => URL.revokeObjectURL(url));
                            setImageUrls([]);
                            setMainImageIndex(0);
                            showNotification('info', 'Toutes les images ont été supprimées');
                          }}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Tout supprimer
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imageUrls.map((url, index) => (
                          <div 
                            key={index} 
                            className={`relative group rounded-xl overflow-hidden border-2 ${images[index]?.isMain ? 'border-yellow-400' : 'border-gray-200'} transition-all duration-200`}
                          >
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                console.error(`Erreur chargement image ${index}:`, url);
                                e.target.src = 'https://via.placeholder.com/300x200?text=Erreur+Image';
                              }}
                            />
                            
                            {/* Overlay d'actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetMainImage(index);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${images[index]?.isMain ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
                                title={images[index]?.isMain ? 'Image principale' : 'Définir comme principale'}
                              >
                                {images[index]?.isMain ? '⭐' : '☆'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(index);
                                }}
                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                title="Supprimer l'image"
                              >
                                ✕
                              </button>
                            </div>
                            
                            {/* Badge image principale */}
                            {images[index]?.isMain && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                                Principale
                              </div>
                            )}
                            
                            {/* Numéro de l'image */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Détails techniques */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3">
                      📐
                    </span>
                    Détails techniques
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Prix */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix (€) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          min="0"
                          step="1000"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="350 000"
                        />
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="HOUSE">🏠 Maison</option>
                        <option value="APARTMENT">🏢 Appartement</option>
                        <option value="VILLA">🏡 Villa</option>
                        <option value="LAND">🌱 Terrain</option>
                        <option value="COMMERCIAL">🏪 Commercial</option>
                        <option value="OFFICE">💼 Bureau</option>
                      </select>
                    </div>

                    {/* Surface */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surface (m²)
                      </label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">m²</span>
                        <input
                          type="number"
                          name="surface"
                          value={formData.surface}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pr-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="120"
                        />
                      </div>
                    </div>

                    {/* Chambres */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chambres
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>

                    {/* Salles de bain */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salles de bain
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2"
                      />
                    </div>

                    {/* Statut */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AVAILABLE">🟢 Disponible</option>
                        <option value="PENDING">🟡 En attente</option>
                        <option value="RENTED">🔵 Loué</option>
                        <option value="SOLD">🔴 Vendu</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Localisation */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mr-3">
                      📍
                    </span>
                    Localisation
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Avenue des Champs-Élysées"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Casablanca"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Maroc">🇲🇦 Maroc</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Espagne">🇪🇸 Espagne</option>
                        <option value="Algérie">🇩🇿 Algérie</option>
                        <option value="Tunisie">🇹🇳 Tunisie</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: Équipements */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                      ⚙️
                    </span>
                    Équipements & Services
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { name: 'hasParking', label: '🅿️ Parking', color: 'bg-blue-50 border-blue-200' },
                      { name: 'hasGarden', label: '🌳 Jardin', color: 'bg-green-50 border-green-200' },
                      { name: 'hasPool', label: '🏊 Piscine', color: 'bg-cyan-50 border-cyan-200' },
                      { name: 'hasBalcony', label: '🏙️ Balcon', color: 'bg-purple-50 border-purple-200' },
                      { name: 'hasElevator', label: '⬆️ Ascenseur', color: 'bg-gray-50 border-gray-200' },
                      { name: 'hasAirConditioning', label: '❄️ Climatisation', color: 'bg-indigo-50 border-indigo-200' },
                      { name: 'hasHeating', label: '🔥 Chauffage', color: 'bg-orange-50 border-orange-200' }
                    ].map((item) => (
                      <label
                        key={item.name}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${item.color} ${formData[item.name] ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData[item.name]}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section 6: Caractéristiques additionnelles */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mr-3">
                      ✨
                    </span>
                    Caractéristiques additionnelles
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Détails supplémentaires
                    </label>
                    <textarea
                      name="additionalFeatures"
                      value={formData.additionalFeatures}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sécurité, domotique, vue exceptionnelle, proximité commerces..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Séparez les caractéristiques par des virgules
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Publier la propriété
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Annuler
                    </button>
                  </div>
                  
                  {/* Indicateur d'état */}
                  {isFormDirty && !loading && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                        Modifications non sauvegardées
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
        
        .animate-fadeOutUp {
          animation: fadeOutUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddProperty;