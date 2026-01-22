const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Local Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, degree, yearOfEntry } = req.body;
        let { rollNumber } = req.body;

        // Ensure rollNumber is undefined if empty string (to satisfy sparse unique index)
        if (!rollNumber || rollNumber.trim() === '') {
            rollNumber = undefined;
        }

        if (!email.endsWith('@iitrpr.ac.in')) {
            return res.status(400).json({ msg: 'Only @iitrpr.ac.in emails are allowed' });
        }

        // Determine Role
        let role = 'student';
        if (email === 'facultyadvisor@iitrpr.ac.in') {
            role = 'faculty_advisor';
        } else if (/^[a-zA-Z]/.test(email)) {
            role = 'instructor';
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            rollNumber,
            email,
            password: hashedPassword,
            department,
            degree,
            yearOfEntry,
            pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role
        });

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }

});

const crypto = require('crypto');
const { sendOTP } = require('../utils/emailService');

// Local Login
router.post('/login', async (req, res) => {
    try {
        console.log('Login Request Body:', req.body);
        const { email, password } = req.body;
        const deviceToken = req.cookies.device_token;

        // Hardcoded Admin Login
        console.log('Checking Admin:', email, password);
        if (email === 'admin@aims.com' && password === 'admin123') {
            const payload = { user: { id: 'admin-id', role: 'admin' } };
            jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        name: 'Administrator',
                        email: 'admin@aims.com',
                        role: 'admin',
                        pfp: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
                    }
                });
            });
            return;
        }

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check if user has password (might be Google user)
        if (!user.password) return res.status(400).json({ msg: 'Please login with Google' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check Trusted Device
        let isTrusted = false;
        if (deviceToken && user.trustedDevices) {
            const device = user.trustedDevices.find(d => d.token === deviceToken && d.expires > Date.now());
            if (device) {
                isTrusted = true;
                device.lastUsed = Date.now();
                await user.save();
            }
        }

        if (isTrusted) {
            const payload = { user: { id: user.id, role: user.role } };
            jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({ token, user: { name: user.name, rollNumber: user.rollNumber, pfp: user.pfp, role: user.role } });
            });
        } else {
            // Require 2FA
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
            await user.save();

            await sendOTP(user.email, otp);

            // Pre-Auth Token (expires in 10 mins)
            const preAuthToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '10m' });

            res.json({
                step: '2fa_required',
                message: 'OTP sent to your email',
                preAuthToken
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp, preAuthToken, rememberDevice } = req.body;

        if (!preAuthToken) return res.status(400).json({ msg: 'Session expired. Login again.' });

        let decoded;
        try {
            decoded = jwt.verify(preAuthToken, process.env.JWT_SECRET || 'secret');
        } catch (e) {
            return res.status(400).json({ msg: 'Session expired. Login again.' });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ msg: 'User not found' });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or Expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        // Handle Remember Me
        if (rememberDevice) {
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

            user.trustedDevices.push({
                token,
                expires: expiry
            });

            res.cookie('device_token', token, {
                httpOnly: true,
                expires: expiry,
                secure: false // Set true if https
            });
        }

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, rollNumber: user.rollNumber, pfp: user.pfp, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT
        const payload = { user: { id: req.user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // Redirect to client with token
            res.redirect(`http://localhost:5173/login?token=${token}`);
        });
    }
);

router.get('/me', async (req, res) => {
    // Simple middleware verification
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Handle Virtual Admin
        if (decoded.user.id === 'admin-id') {
            return res.json({
                _id: 'admin-id',
                name: 'Administrator',
                email: 'admin@aims.com',
                role: 'admin',
                pfp: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
            });
        }

        const user = await User.findById(decoded.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

module.exports = router;
