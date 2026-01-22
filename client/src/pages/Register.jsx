import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link,
    Fade,
    Slide,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { School, CheckCircle } from '@mui/icons-material';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isStudent, setIsStudent] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'email') {
            const isStudentEmail = /^\d/.test(value);
            setIsStudent(isStudentEmail);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setIsLoading(false);
            return setError('Passwords do not match');
        }

        if (!formData.email.endsWith('@iitrpr.ac.in')) {
            setIsLoading(false);
            return setError('Only @iitrpr.ac.in emails are allowed');
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/auth/register`, {
                name: formData.name,
                rollNumber: formData.rollNumber,
                email: formData.email,
                password: formData.password,
                department: 'Unknown',
                degree: 'B.Tech',
                yearOfEntry: new Date().getFullYear().toString()
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Container component="main" maxWidth="xs">
                <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Fade in={true} timeout={800}>
                        <Paper
                            elevation={24}
                            className="glass-paper"
                            sx={{
                                p: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 4,
                                textAlign: 'center',
                            }}
                        >
                            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography component="h1" variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                                Registration Successful!
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                                Your account has been created. You can now login with your credentials.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{
                                    py: 1.8,
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    },
                                }}
                            >
                                Go to Login
                            </Button>
                        </Paper>
                    </Fade>
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Fade in={true} timeout={800}>
                    <Paper
                        elevation={24}
                        className="glass-paper"
                        sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            width: '100%',
                        }}
                    >
                        <Slide direction="down" in={true} timeout={600}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <School sx={{ fontSize: 36, color: 'primary.main', mr: 1 }} />
                                <Typography component="h1" variant="h4" fontWeight="bold" className="gradient-text">
                                    Create Account
                                </Typography>
                            </Box>
                        </Slide>
                        <Typography component="p" variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
                            Join AIMS today
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {isStudent && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="rollNumber"
                                    label="Entry No."
                                    name="rollNumber"
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                />
                            )}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">Show Password</Typography>}
                                sx={{ mb: 1, display: 'block' }}
                            />

                            {error && (
                                <Fade in={true}>
                                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                                </Fade>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.8,
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    },
                                }}
                            >
                                {isLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
                                        <span>Creating account...</span>
                                    </Box>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>

                            <Box textAlign="center">
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        '&:hover': {
                                            color: 'primary.dark',
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Already have an account? Login here
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default Register;
