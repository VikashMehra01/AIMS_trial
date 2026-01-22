import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    Alert,
    Link,
    Fade,
    Slide,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { School, Security } from '@mui/icons-material';

const Login = () => {
    const { login, user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [authStep, setAuthStep] = useState('credentials'); // 'credentials' | 'otp'
    const [otp, setOtp] = useState('');
    const [preAuthToken, setPreAuthToken] = useState('');
    const [rememberDevice, setRememberDevice] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSentMessage, setOtpSentMessage] = useState('');

    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/dashboard" />;
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // STEP 1: Login with Credentials
            if (authStep === 'credentials') {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.post(`${apiUrl}/auth/login`, formData, {
                    withCredentials: true // Important for cookies
                });

                if (res.data.step === '2fa_required') {
                    setAuthStep('otp');
                    setPreAuthToken(res.data.preAuthToken);
                    setOtpSentMessage(res.data.message);
                } else {
                    // Trusted device or Admin -> Login Success
                    login(res.data.token);
                }
            }
            // STEP 2: Verify OTP
            else {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.post(`${apiUrl}/auth/verify-otp`, {
                    otp,
                    preAuthToken,
                    rememberDevice
                }, {
                    withCredentials: true
                });

                login(res.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/auth/google`;
    };

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
                                {authStep === 'otp' ? (
                                    <Security sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                                ) : (
                                    <School sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                                )}
                                <Typography
                                    component="h1"
                                    variant="h3"
                                    fontWeight="bold"
                                    className="gradient-text"
                                >
                                    {authStep === 'otp' ? 'Security Check' : 'AIMS'}
                                </Typography>
                            </Box>
                        </Slide>

                        <Typography component="h2" variant="h6" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
                            {authStep === 'otp' ? 'Enter the OTP sent to your email' : 'Academic Information Management System'}
                        </Typography>

                        {authStep === 'credentials' && (
                            <>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<FcGoogle size={24} />}
                                    onClick={handleGoogleLogin}
                                    sx={{
                                        mt: 1,
                                        mb: 3,
                                        py: 1.8,
                                        borderColor: '#e0e0e0',
                                        color: '#333',
                                        backgroundColor: 'white',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        '&:hover': {
                                            borderColor: '#6366f1',
                                            backgroundColor: 'rgba(99, 102, 241, 0.04)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Sign in with Google
                                </Button>

                                <Divider sx={{ width: '100%', mb: 3 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        or continue with email
                                    </Typography>
                                </Divider>
                            </>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            {authStep === 'credentials' ? (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={formData.email}
                                        onChange={handleChange}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        sx={{ mb: 1 }}
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
                                        sx={{ mb: 2, display: 'block' }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                                        <Alert severity="info" sx={{ mb: 2 }}>{otpSentMessage}</Alert>
                                    </Box>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="otp"
                                        label="6-Digit OTP"
                                        name="otp"
                                        autoComplete="off"
                                        autoFocus
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        sx={{ mb: 2, '& input': { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' } }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberDevice}
                                                onChange={(e) => setRememberDevice(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Remember this device for 30 days"
                                        sx={{ mt: 1, mb: 2, display: 'block', textAlign: 'left' }}
                                    />
                                </>
                            )}

                            {error && (
                                <Fade in={true}>
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                sx={{
                                    mt: 2,
                                    mb: 3,
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
                                        <span>{authStep === 'credentials' ? 'Logging in...' : 'Verifying...'}</span>
                                    </Box>
                                ) : (
                                    authStep === 'credentials' ? 'Login' : 'Verify & Login'
                                )}
                            </Button>

                            {authStep === 'credentials' && (
                                <Box textAlign="center">
                                    <Link
                                        component={RouterLink}
                                        to="/register"
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            '&:hover': {
                                                color: 'primary.dark',
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        Don't have an account? Sign Up
                                    </Link>
                                </Box>
                            )}
                            {authStep === 'otp' && (
                                <Box textAlign="center">
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => {
                                            setAuthStep('credentials');
                                            setError('');
                                        }}
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            '&:hover': {
                                                color: 'primary.dark',
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        Back to Login
                                    </Link>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default Login;
