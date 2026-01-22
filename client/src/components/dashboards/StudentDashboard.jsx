import React, { useState } from 'react';
import AvailableCourses from '../courses/AvailableCourses';
import MyRegistrations from '../courses/MyRegistrations';
import { 
    Box, 
    Paper, 
    Typography, 
    Tabs, 
    Tab,
    Container,
    Fade
} from '@mui/material';
import { School, Assignment } from '@mui/icons-material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Fade in={true} timeout={500}>
                    <Box sx={{ py: 3 }}>
                        {children}
                    </Box>
                </Fade>
            )}
        </div>
    );
}

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Fade in={true} timeout={800}>
                <Box>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 700,
                            mb: 3,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Student Dashboard
                    </Typography>

                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: 3,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs 
                                value={activeTab} 
                                onChange={handleChange} 
                                aria-label="student dashboard tabs"
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        borderRadius: '3px 3px 0 0',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    }
                                }}
                            >
                                <Tab 
                                    icon={<School />} 
                                    iconPosition="start" 
                                    label="Available Courses" 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        px: 3,
                                        py: 2.5,
                                    }}
                                />
                                <Tab 
                                    icon={<Assignment />} 
                                    iconPosition="start" 
                                    label="My Registrations" 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        px: 3,
                                        py: 2.5,
                                    }}
                                />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <TabPanel value={activeTab} index={0}>
                                <AvailableCourses />
                            </TabPanel>
                            <TabPanel value={activeTab} index={1}>
                                <MyRegistrations />
                            </TabPanel>
                        </Box>
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
};

export default StudentDashboard;
