import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    Typography,
    Chip,
    Button,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NearMeIcon from '@mui/icons-material/NearMe';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { styled } from '@mui/material/styles';

const StyledSlider = styled(Slider)(({ theme }) => ({
    color: theme.palette.primary.main,
    height: 6,
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: theme.palette.primary.main,
        '&:hover, &.Mui-focusVisible': {
            boxShadow: '0px 0px 0px 8px rgba(59, 130, 246, 0.16)',
        },
    },
    '& .MuiSlider-rail': {
        backgroundColor: theme.palette.grey[300],
    },
}));

const DistanceChip = styled(Chip)(({ theme, selected }) => ({
    margin: theme.spacing(0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[2],
    },
    ...(selected && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
}));

const NearbyFilter = ({ 
    onFilterChange, 
    onUseMyLocation, 
    onUseAddressLocation,
    defaultRadius = 10,
    isLoading = false,
    locationEnabled = false,
    userLocation = null
}) => {
    const [radius, setRadius] = useState(defaultRadius);
    const [isUsingLocation, setIsUsingLocation] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const radiusOptions = [
        { value: 1, label: '1 km' },
        { value: 3, label: '3 km' },
        { value: 5, label: '5 km' },
        { value: 10, label: '10 km' },
        { value: 20, label: '20 km' },
        { value: 50, label: '50 km' },
        { value: 100, label: '100 km' }
    ];

    const handleRadiusChange = (event, newValue) => {
        setRadius(newValue);
        onFilterChange({
            radius: newValue,
            useCurrentLocation: isUsingLocation
        });
    };

    const handleUseMyLocation = async () => {
        setIsUsingLocation(true);
        if (onUseMyLocation) {
            await onUseMyLocation();
        }
    };

    const handleUseAddressLocation = () => {
        setIsUsingLocation(false);
        if (onUseAddressLocation) {
            onUseAddressLocation();
        }
    };

    const handleToggleAdvanced = () => {
        setShowAdvanced(!showAdvanced);
    };

    useEffect(() => {
        // Appliquer le filtre dès le changement
        onFilterChange({
            radius,
            useCurrentLocation: isUsingLocation
        });
    }, [radius, isUsingLocation]);

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: locationEnabled ? 'primary.light' : 'grey.300',
                backgroundColor: locationEnabled ? 'primary.50' : 'background.paper'
            }}
        >
            <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon 
                    color={locationEnabled ? "primary" : "disabled"} 
                    sx={{ mr: 1, fontSize: 28 }} 
                />
                <Typography variant="h6" color={locationEnabled ? "primary.main" : "text.primary"}>
                    Recherche par localisation
                </Typography>
                {isLoading && (
                    <CircularProgress size={20} sx={{ ml: 2 }} />
                )}
            </Box>

            <Box mb={3}>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Trouvez des propriétés près de votre position actuelle ou d'une adresse spécifique.
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                        variant={isUsingLocation && locationEnabled ? "contained" : "outlined"}
                        onClick={handleUseMyLocation}
                        startIcon={
                            isLoading ? (
                                <CircularProgress size={20} />
                            ) : locationEnabled && userLocation ? (
                                <MyLocationIcon />
                            ) : (
                                <LocationSearchingIcon />
                            )
                        }
                        color="primary"
                        disabled={isLoading}
                        sx={{ minWidth: 200 }}
                    >
                        {locationEnabled && userLocation ? 'Ma position actuelle' : 'Utiliser ma position'}
                    </Button>
                    
                    <Button
                        variant={!isUsingLocation ? "contained" : "outlined"}
                        onClick={handleUseAddressLocation}
                        startIcon={<LocationOffIcon />}
                        color="secondary"
                        sx={{ minWidth: 200 }}
                    >
                        Recherche par adresse
                    </Button>
                </Box>
                
                {locationEnabled && userLocation && (
                    <Alert 
                        severity="info" 
                        icon={<NearMeIcon />}
                        sx={{ mt: 2 }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2">
                                Position détectée: {userLocation.latitude?.toFixed(4)}, {userLocation.longitude?.toFixed(4)}
                            </Typography>
                            <Chip
                                label="Position activée"
                                color="success"
                                size="small"
                                variant="outlined"
                                icon={<NearMeIcon />}
                            />
                        </Box>
                    </Alert>
                )}
                
                {!locationEnabled && isUsingLocation && (
                    <Alert 
                        severity="warning" 
                        sx={{ mt: 2 }}
                    >
                        <Typography variant="body2">
                            La géolocalisation n'est pas activée. Cliquez sur "Utiliser ma position" pour l'activer.
                        </Typography>
                    </Alert>
                )}
            </Box>

            <Box mb={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight="medium">
                        Rayon de recherche : <strong>{radius} km</strong>
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showAdvanced}
                                onChange={handleToggleAdvanced}
                                size="small"
                            />
                        }
                        label="Options avancées"
                    />
                </Box>
                
                {showAdvanced ? (
                    <StyledSlider
                        value={radius}
                        onChange={handleRadiusChange}
                        onChangeCommitted={(e, value) => {
                            setRadius(value);
                            onFilterChange({ 
                                radius: value, 
                                useCurrentLocation: isUsingLocation 
                            });
                        }}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value} km`}
                        step={1}
                        marks
                        min={1}
                        max={100}
                        sx={{ mb: 3 }}
                    />
                ) : (
                    <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        {radiusOptions.map((option) => (
                            <DistanceChip
                                key={option.value}
                                label={option.label}
                                onClick={() => {
                                    setRadius(option.value);
                                    onFilterChange({ 
                                        radius: option.value, 
                                        useCurrentLocation: isUsingLocation 
                                    });
                                }}
                                selected={radius === option.value}
                                variant={radius === option.value ? "filled" : "outlined"}
                            />
                        ))}
                    </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {radius <= 5 ? 'À proximité immédiate' : 
                     radius <= 20 ? 'Dans le quartier' : 
                     'Large périmètre de recherche'}
                </Typography>
            </Box>

            {locationEnabled && (
                <Alert 
                    severity="info" 
                    sx={{ 
                        mt: 2,
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        }
                    }}
                >
                    <Typography variant="body2">
                        <strong>Conseil :</strong> Plus le rayon est petit, plus les résultats seront pertinents.
                    </Typography>
                </Alert>
            )}
        </Paper>
    );
};

export default NearbyFilter;