import api from './authApi.js';

const locationApi = {
    // Obtenir la localisation de l'utilisateur via le navigateur
    getUserLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let errorMessage = 'Impossible d\'obtenir votre position';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permission de géolocalisation refusée';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Position indisponible';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Délai d\'attente dépassé';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },
    
    // Rechercher les propriétés à proximité par coordonnées
    getNearbyProperties: (latitude, longitude, radius = 10) => {
        return api.post('/api/properties/nearby', {
            latitude,
            longitude,
            radius,
            page: 0,
            size: 20
        });
    },
    
    // Propriétés proches de l'utilisateur connecté
    getNearbyPropertiesForUser: (radius = 10) => {
        return api.get(`/api/properties/nearby/me?radius=${radius}`);
    },
    
    // Mettre à jour la localisation de l'utilisateur
    updateUserLocation: (latitude, longitude) => {
        return api.post('/api/properties/user/location', null, {
            params: { latitude, longitude }
        });
    },
    
    // Vérifier si la géolocalisation est supportée
    isGeolocationSupported: () => {
        return 'geolocation' in navigator;
    },
    
    // Demander la permission (wrapper pour la permission)
    requestPermission: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.permissions) {
                // Fallback pour les navigateurs qui ne supportent pas l'API permissions
                resolve('prompt');
                return;
            }
            
            navigator.permissions.query({ name: 'geolocation' })
                .then((result) => {
                    resolve(result.state);
                })
                .catch(() => {
                    resolve('prompt');
                });
        });
    }
};

export default locationApi;