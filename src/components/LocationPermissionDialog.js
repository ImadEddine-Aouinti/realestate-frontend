import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MapIcon from '@mui/icons-material/Map';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const steps = [
    {
        label: 'Pourquoi cette permission ?',
        description: 'Nous avons besoin de votre position pour vous montrer les propriétés les plus proches de vous.',
        icon: <LocationOnIcon />
    },
    {
        label: 'Comment utilisons-nous vos données ?',
        description: 'Votre position est utilisée uniquement pour cette recherche et n\'est jamais stockée de façon permanente.',
        icon: <PrivacyTipIcon />
    },
    {
        label: 'Contrôle total',
        description: 'Vous pouvez désactiver cette fonctionnalité à tout moment dans vos paramètres.',
        icon: <ShieldIcon />
    }
];

const LocationPermissionDialog = ({ 
    open, 
    onClose, 
    onGrant, 
    onDeny,
    isGeolocationSupported = true 
}) => {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleGrantWithSteps = () => {
        setActiveStep(0);
        onGrant();
    };

    const handleDenyWithSteps = () => {
        setActiveStep(0);
        onDeny();
    };

    if (!isGeolocationSupported) {
        return (
            <Dialog open={open} onClose={handleDenyWithSteps} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon color="warning" />
                        <Typography variant="h6">Géolocalisation non supportée</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Votre navigateur ne supporte pas la géolocalisation.
                    </Alert>
                    <Typography paragraph>
                        Vous pouvez toujours rechercher des propriétés près d'une adresse spécifique en utilisant le champ de recherche.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDenyWithSteps} color="inherit">
                        Compris
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={handleDenyWithSteps} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <GpsFixedIcon color="primary" />
                    <Typography variant="h6">Activer la géolocalisation</Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{ color: activeStep >= index ? 'primary.main' : 'grey.400' }}>
                                        {step.icon}
                                    </Box>
                                )}
                            >
                                <Typography variant="subtitle1" fontWeight="medium">
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                                <Box sx={{ mb: 2, mt: 1 }}>
                                    {index === 0 && (
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Recherche personnalisée" 
                                                    secondary="Voir les propriétés les plus proches de vous"
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Gain de temps" 
                                                    secondary="Évitez les déplacements inutiles"
                                                />
                                            </ListItem>
                                        </List>
                                    )}
                                    {index === 1 && (
                                        <Alert severity="info" icon={<PrivacyTipIcon />}>
                                            <Typography variant="caption">
                                                <strong>Respect de la vie privée :</strong><br />
                                                • Utilisation unique pour cette recherche<br />
                                                • Pas de stockage permanent<br />
                                                • Pas de partage avec des tiers
                                            </Typography>
                                        </Alert>
                                    )}
                                    {index === 2 && (
                                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="caption">
                                                Vous pouvez à tout moment :<br />
                                                1. Désactiver dans les paramètres du navigateur<br />
                                                2. Refuser la permission<br />
                                                3. Utiliser une adresse manuellement
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                        size="small"
                                    >
                                        {index === steps.length - 1 ? 'Terminer' : 'Continuer'}
                                    </Button>
                                    <Button
                                        disabled={index === 0}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                        size="small"
                                    >
                                        Retour
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Alternative :</strong> Vous pouvez également rechercher des propriétés près d'une adresse spécifique dans les filtres avancés.
                    </Typography>
                </Alert>

                <Box display="flex" gap={2} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<MapIcon />}
                        onClick={handleDenyWithSteps}
                        fullWidth
                    >
                        Utiliser une adresse
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LocationOnIcon />}
                        onClick={handleGrantWithSteps}
                        fullWidth
                        autoFocus
                    >
                        Activer la géolocalisation
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LocationPermissionDialog;