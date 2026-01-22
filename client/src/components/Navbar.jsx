import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Chip,
    useScrollTrigger,
    Slide
} from '@mui/material';
import { AccountCircle, School, Dashboard as DashboardIcon, Logout, Person } from '@mui/icons-material';

function HideOnScroll(props) {
    const { children } = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const Navbar = (props) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    if (!user) return null;

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return 'error';
            case 'instructor': return 'success';
            case 'faculty_advisor': return 'warning';
            case 'student': return 'primary';
            default: return 'default';
        }
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'faculty_advisor': return 'Faculty Advisor';
            default: return role.charAt(0).toUpperCase() + role.slice(1);
        }
    };

    return (
        <HideOnScroll {...props}>
            <AppBar 
                position="sticky" 
                elevation={0}
                sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '2px solid rgba(99, 102, 241, 0.15)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.12)',
                    }
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            <RouterLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                                AIMS Portal
                            </RouterLink>
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/dashboard"
                            startIcon={<DashboardIcon />}
                            sx={{ 
                                color: 'text.primary',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                }
                            }}
                        >
                            Dashboard
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {user.name}
                                </Typography>
                                <Chip 
                                    label={getRoleLabel(user.role)} 
                                    size="small" 
                                    color={getRoleColor(user.role)}
                                    sx={{ 
                                        height: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                            
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                sx={{
                                    border: '2px solid',
                                    borderColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                    }
                                }}
                            >
                                {user.pfp ? (
                                    <Avatar 
                                        alt={user.name} 
                                        src={user.pfp} 
                                        imgProps={{ referrerPolicy: 'no-referrer' }} 
                                        sx={{ width: 36, height: 36 }} 
                                    />
                                ) : (
                                    <AccountCircle sx={{ color: 'primary.main', fontSize: 36 }} />
                                )}
                            </IconButton>
                            
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        borderRadius: 2,
                                        minWidth: 200,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    }
                                }}
                            >
                                <MenuItem 
                                    onClick={() => { handleClose(); navigate('/profile'); }}
                                    sx={{ 
                                        gap: 1.5,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                        }
                                    }}
                                >
                                    <Person fontSize="small" />
                                    Profile
                                </MenuItem>
                                <MenuItem 
                                    onClick={handleLogout}
                                    sx={{ 
                                        gap: 1.5,
                                        py: 1.5,
                                        color: 'error.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                        }
                                    }}
                                >
                                    <Logout fontSize="small" />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
};

export default Navbar;
