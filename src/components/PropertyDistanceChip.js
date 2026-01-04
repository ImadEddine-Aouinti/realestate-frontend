import React from 'react';
import { 
    Chip, 
    Box, 
    Typography, 
    Tooltip,
    LinearProgress,
    linearProgressClasses,
    styled 
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import DirectionsIcon from '@mui/icons-material/Directions';
import PlaceIcon from '@mui/icons-material/Place';

const DistanceLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 4,
    borderRadius: 2,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[200],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 2,
    },
}));

const PropertyDistanceChip = ({ 
    distance, 
    showIcon = true, 
    variant = 'outlined', 
    size = 'small',
    showProgress = false,
    maxDistance = 50 
}) => {
    if (!distance || distance === undefined || distance === null) return null;
    
    const getDistanceColor = (dist) => {
        if (dist <= 2) return 'success';
        if (dist <= 5) return 'info';
        if (dist <= 15) return 'warning';
        return 'error';
    };
    
    const getDistanceText = (dist) => {
        if (dist < 1) return `${(dist * 1000).toFixed(0)} m`;
        if (dist < 10) return `${dist.toFixed(1)} km`;
        return `${Math.round(dist)} km`;
    };
    
    const getDistanceLabel = (dist) => {
        if (dist <= 2) return 'Très proche';
        if (dist <= 5) return 'À proximité';
        if (dist <= 15) return 'Dans le quartier';
        if (dist <= 30) return 'Accessible';
        return 'Loin';
    };
    
    const progressValue = Math.min(100, (distance / maxDistance) * 100);
    
    return (
        <Tooltip 
            title={
                <Box>
                    <Typography variant="caption" display="block">
                        Distance: <strong>{distance.toFixed(1)} km</strong>
                    </Typography>
                    <Typography variant="caption" display="block">
                        {getDistanceLabel(distance)}
                    </Typography>
                    {showProgress && (
                        <Box sx={{ mt: 1, width: 100 }}>
                            <DistanceLinearProgress 
                                variant="determinate" 
                                value={progressValue}
                                color={getDistanceColor(distance)}
                            />
                        </Box>
                    )}
                </Box>
            }
            arrow
        >
            <Box>
                <Chip
                    icon={showIcon ? <NearMeIcon fontSize="small" /> : null}
                    label={
                        <Box display="flex" alignItems="center" gap={0.5}>
                            {!showIcon && <PlaceIcon fontSize="small" />}
                            <Typography variant="caption" fontWeight="medium">
                                {getDistanceText(distance)}
                            </Typography>
                            {!showProgress && (
                                <DirectionsIcon fontSize="small" sx={{ ml: 0.5 }} />
                            )}
                        </Box>
                    }
                    color={getDistanceColor(distance)}
                    size={size}
                    variant={variant}
                    sx={{
                        '& .MuiChip-label': {
                            px: 1,
                        },
                        borderWidth: variant === 'outlined' ? 2 : undefined,
                        fontWeight: 'medium'
                    }}
                />
                {showProgress && (
                    <Box sx={{ width: '100%', mt: 0.5 }}>
                        <DistanceLinearProgress 
                            variant="determinate" 
                            value={progressValue}
                            color={getDistanceColor(distance)}
                        />
                    </Box>
                )}
            </Box>
        </Tooltip>
    );
};

export default PropertyDistanceChip;