import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                    size={size} 
                    thickness={4}
                    sx={{
                        color: 'primary.main',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        },
                    }}
                />
            </Box>
            <Typography 
                variant="h6" 
                color="primary"
                sx={{ 
                    fontWeight: 600,
                    animation: 'pulse 2s ease-in-out infinite',
                }}
            >
                {message}
            </Typography>
        </Box>
    );
};

export default LoadingSpinner;
