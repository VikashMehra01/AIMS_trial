import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            let token = localStorage.getItem('token');
            if (!token) {
                // Check URL params for token (from Google Login redirect)
                const urlParams = new URLSearchParams(window.location.search);
                token = urlParams.get('token');
                if (token) {
                    localStorage.setItem('token', token);
                    // Remove token from URL to clean it up
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }

            if (token) {
                try {
                    // Use relative URL to leverage proxy
                    const res = await axios.get('/auth/me', {
                        headers: { 'x-auth-token': token }
                    });
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        // We need to fetch user to know the role for redirection
        // Reloading the page will trigger checkLoggedIn which fetches user
        // But for smoother UX we could fetch here. For now, simple reload works or redirection in Login component.
        // Let's rely on Login component for redirection after setting token.
        // Wait, checkLoggedIn runs ONCE on mount. Calling login() needs to update state.
        
        // Quick fix: Hard reload to reset state is reliable but slow.
        // Better: Fetch user immediately.
        
        const fetchUser = async () => {
             try {
                const res = await axios.get('/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data);
                // Redirect based on role? Or let Component handle it.
                // Login.jsx handles it if user state is updated.
            } catch (err) {
                console.error(err);
            }
        }
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
