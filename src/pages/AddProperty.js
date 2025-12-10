import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/propertyApi.js';

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
  
  // NOUVEAU : État pour les images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // NOUVEAU : Gestion des images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];

    files.forEach((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      newImageFiles.push(file);
      newImageUrls.push(imageUrl);
    });

    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    
    // Ajouter les nouvelles images à l'état des images
    const newImages = files.map((file, index) => ({
      url: '', // À remplir après upload
      altText: file.name,
      isMain: false
    }));
    
    // Marquer la première image comme principale si c'est la première
    if (images.length === 0 && newImages.length > 0) {
      newImages[0].isMain = true;
      setMainImageIndex(0);
    }
    
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    const newImages = [...images];
    
    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);
    newImages.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    setImages(newImages);
    
    // Si on supprime l'image principale, mettre la première image restante comme principale
    if (index === mainImageIndex && newImages.length > 0) {
      newImages[0].isMain = true;
      setMainImageIndex(0);
    }
  };

  const handleSetMainImage = (index) => {
    const newImages = [...images];
    
    // Réinitialiser toutes les images à non principale
    newImages.forEach(img => img.isMain = false);
    
    // Définir l'image sélectionnée comme principale
    newImages[index].isMain = true;
    
    setImages(newImages);
    setMainImageIndex(index);
  };

  // Fonction pour uploader les images (à implémenter côté backend)
  const uploadImages = async (propertyId) => {
    const uploadedImages = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      // Simuler l'upload d'image
      // Dans la vraie application, vous enverriez le fichier au backend
      const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}-${i}`;
      
      uploadedImages.push({
        url: mockImageUrl,
        altText: file.name,
        isMain: images[i]?.isMain || false
      });
    }
    
    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.price || !formData.type) {
      setError('Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convertir les champs numériques
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        surface: formData.surface ? parseFloat(formData.surface) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        yearBuilt: null, // À ajouter dans le formulaire si besoin
        rooms: null, // À ajouter dans le formulaire si besoin
        // Ajouter les images
        images: images.map((img, index) => ({
          url: imageUrls[index] || `https://via.placeholder.com/400x300?text=${formData.title}`,
          altText: img.altText,
          isMain: img.isMain
        }))
      };

      console.log('📤 Données envoyées:', propertyData);
      
      const createdProperty = await propertyApi.createProperty(propertyData);
      
      // Si vous avez un endpoint pour uploader les images, appelez-le ici
      if (createdProperty.id && imageFiles.length > 0) {
        const uploadedImages = await uploadImages(createdProperty.id);
        // Mettre à jour la propriété avec les vraies URLs
      }
      
      setSuccess('Propriété ajoutée avec succès !');
      
      // Réinitialiser le formulaire
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
      setImages([]);
      setImageFiles([]);
      setImageUrls([]);
      setMainImageIndex(0);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/my-properties');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de la propriété');
      console.error('❌ Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Ajouter une nouvelle propriété
                  </h1>
                  <p className="text-gray-600">
                    Remplissez le formulaire ci-dessous pour ajouter votre propriété
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <strong>Erreur :</strong> {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <strong>Succès :</strong> {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Belle villa moderne avec piscine"
                />
              </div>

              {/* Description */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre propriété en détail..."
                />
              </div>

              {/* SECTION IMAGES - NOUVEAU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images de la propriété
                </label>
                
                {/* Aperçu des images */}
                <div className="mb-4">
                  {imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(index)}
                              className={`p-2 rounded-full ${images[index]?.isMain ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
                              title={images[index]?.isMain ? 'Image principale' : 'Définir comme principale'}
                            >
                              {images[index]?.isMain ? '⭐' : '☆'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-2 bg-red-500 text-white rounded-full"
                              title="Supprimer l'image"
                            >
                              ✕
                            </button>
                          </div>
                          {images[index]?.isMain && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                              Principale
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-500">Aucune image sélectionnée</p>
                    </div>
                  )}
                </div>

                {/* Input pour uploader les images */}
                <label className="block">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200 cursor-pointer">
                    <div className="space-y-1 text-center">
                      <div className="text-2xl mb-2">📤</div>
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Télécharger des fichiers</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="sr-only"
                          />
                        </span>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Prix et Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 350000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="HOUSE">Maison</option>
                    <option value="APARTMENT">Appartement</option>
                    <option value="VILLA">Villa</option>
                    <option value="LAND">Terrain</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="OFFICE">Bureau</option>
                  </select>
                </div>
              </div>

              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 120"
                />
              </div>

              {/* Chambres et Salles de bain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de chambres
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de salles de bain
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 2"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 123 Rue de la Paix"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Casablanca"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 20000"
                  />
                </div>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Maroc">Maroc</option>
                  <option value="France">France</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Algérie">Algérie</option>
                  <option value="Tunisie">Tunisie</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AVAILABLE">🟢 Disponible</option>
                  <option value="PENDING">🟡 En attente</option>
                  <option value="RENTED">🏠 Loué</option>
                  <option value="SOLD">🔴 Vendu</option>
                </select>
              </div>

              {/* Équipements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Équipements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasParking"
                      checked={formData.hasParking}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>🅿️ Parking</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasGarden"
                      checked={formData.hasGarden}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>🌳 Jardin</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasPool"
                      checked={formData.hasPool}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>🏊 Piscine</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasBalcony"
                      checked={formData.hasBalcony}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>🏙️ Balcon</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasElevator"
                      checked={formData.hasElevator}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>⬆️ Ascenseur</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasAirConditioning"
                      checked={formData.hasAirConditioning}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>❄️ Climatisation</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasHeating"
                      checked={formData.hasHeating}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>🔥 Chauffage</span>
                  </label>
                </div>
              </div>

              {/* Caractéristiques additionnelles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caractéristiques additionnelles
                </label>
                <textarea
                  name="additionalFeatures"
                  value={formData.additionalFeatures}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Autres caractéristiques (sécurité, domotique, vue, etc.)"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🏠</span>
                      Ajouter la propriété
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;