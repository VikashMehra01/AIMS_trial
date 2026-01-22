import React from 'react';
import Navbar from './Navbar';
import { Box, Container, Fade } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
            }}
        >
            <Navbar />
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1,
                    pb: 4,
                }}
            >
                <Fade in={true} timeout={600}>
                    <Box>
                        {children}
                    </Box>
                </Fade>
            </Box>
            
            {/* Optional Footer */}
            <Box 
                component="footer" 
                sx={{ 
                    py: 3, 
                    px: 2, 
                    mt: 'auto',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(99, 102, 241, 0.1)',
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                    }}>
                        <span>© 2026 AIMS Portal</span>
                        <span>•</span>
                        <span>Academic Information Management System</span>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
