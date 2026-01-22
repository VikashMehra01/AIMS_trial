import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    Chip,
    Fade,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { 
    Email, 
    School, 
    Badge, 
    CalendarMonth, 
    Person 
} from '@mui/icons-material';

const Profile = () => {
    const { user } = useContext(AuthContext);

    const InfoItem = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
            }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={true} timeout={800}>
                <Box>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 700,
                            mb: 4,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        My Profile
                    </Typography>

                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <Box 
                            sx={{ 
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                height: 120,
                                position: 'relative',
                            }}
                        />
                        
                        <Box sx={{ p: 4, pt: 0 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-end',
                                gap: 3,
                                mb: 4,
                                flexWrap: 'wrap',
                            }}>
                                <Avatar
                                    src={user.pfp}
                                    alt={user.name}
                                    imgProps={{ referrerPolicy: 'no-referrer' }}
                                    sx={{ 
                                        width: 120, 
                                        height: 120,
                                        border: '4px solid white',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        mt: -7,
                                    }}
                                />
                                <Box sx={{ flex: 1, pb: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                        {user.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip 
                                            label={user.role === 'faculty_advisor' ? 'Faculty Advisor' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                                            color="primary"
                                            sx={{ fontWeight: 600 }}
                                        />
                                        {user.department && (
                                            <Chip 
                                                label={user.department} 
                                                variant="outlined"
                                                color="primary"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            <Grid container spacing={3}>
                                {user.role === 'student' && user.rollNumber && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <InfoItem 
                                            icon={<Badge />}
                                            label="Entry Number"
                                            value={user.rollNumber}
                                        />
                                    </Grid>
                                )}
                                
                                <Grid item xs={12} sm={6} md={4}>
                                    <InfoItem 
                                        icon={<Email />}
                                        label="Email Address"
                                        value={user.email}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <InfoItem 
                                        icon={<School />}
                                        label="Department"
                                        value={user.department}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <InfoItem 
                                        icon={<Person />}
                                        label="Degree"
                                        value={user.degree}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <InfoItem 
                                        icon={<CalendarMonth />}
                                        label="Year of Entry"
                                        value={user.yearOfEntry}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
};

export default Profile;
