import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Fade,
    Paper,
    CircularProgress
} from '@mui/material';
import { School, Person, Star } from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/courses', {
                    headers: { 'x-auth-token': token }
                });
                setCourses(res.data);
            } catch (err) {
                console.error(err);
                // Mock data if fetch fails (for demo purposes)
                setCourses([
                    { _id: 1, courseCode: 'CS301', courseName: 'Database Systems', instructor: 'Dr. John Doe', slot: 'A', credits: 4, semester: '5' },
                    { _id: 2, courseCode: 'CS302', courseName: 'Operating Systems', instructor: 'Dr. Jane Smith', slot: 'B', credits: 4, semester: '5' },
                    { _id: 3, courseCode: 'CS303', courseName: 'Computer Networks', instructor: 'Dr. Alan Turing', slot: 'C', credits: 3, semester: '5' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <LoadingSpinner message="Loading courses..." />;

    const slotGroups = courses.reduce((acc, course) => {
        const slot = course.slot || 'Other';
        if (!acc[slot]) acc[slot] = [];
        acc[slot].push(course);
        return acc;
    }, {});

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
                            mb: 1,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Registered Courses
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                        View your courses grouped by time slots
                    </Typography>

                    <Grid container spacing={3}>
                        {Object.keys(slotGroups).sort().map((slot, index) => (
                            <Grid item xs={12} key={slot}>
                                <Fade in={true} timeout={800 + index * 100}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(99, 102, 241, 0.1)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            mb: 3,
                                            gap: 1,
                                        }}>
                                            <Chip 
                                                label={`Slot ${slot}`} 
                                                color="primary"
                                                sx={{ 
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    px: 1,
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                }}
                                            />
                                            <Typography variant="body2" color="textSecondary">
                                                {slotGroups[slot].length} {slotGroups[slot].length === 1 ? 'course' : 'courses'}
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            {slotGroups[slot].map((course, courseIndex) => (
                                                <Grid item xs={12} sm={6} md={4} key={course._id}>
                                                    <Fade in={true} timeout={900 + courseIndex * 100}>
                                                        <Card 
                                                            className="hover-float"
                                                            sx={{ 
                                                                height: '100%',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(99, 102, 241, 0.1)',
                                                                transition: 'all 0.3s ease',
                                                            }}
                                                        >
                                                            <CardContent>
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'flex-start',
                                                                    mb: 2,
                                                                }}>
                                                                    <Chip 
                                                                        label={course.courseCode}
                                                                        size="small"
                                                                        sx={{ 
                                                                            fontWeight: 700,
                                                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                                            color: 'primary.main',
                                                                        }}
                                                                    />
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {course.credits}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Typography 
                                                                    variant="h6" 
                                                                    sx={{ 
                                                                        mb: 2,
                                                                        fontWeight: 700,
                                                                        fontSize: '1.1rem',
                                                                        lineHeight: 1.3,
                                                                    }}
                                                                >
                                                                    {course.courseName}
                                                                </Typography>

                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    color: 'text.secondary',
                                                                }}>
                                                                    <Person sx={{ fontSize: 18 }} />
                                                                    <Typography variant="body2">
                                                                        {course.instructor}
                                                                    </Typography>
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </Fade>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default Courses;
