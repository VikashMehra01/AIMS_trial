const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'otp_test_user@iitrpr.ac.in';
const TEST_PASSWORD = 'password123';

async function verifyOtpFlow() {
    console.log('--- STARTING OTP FLOW VERIFICATION ---');

    try {
        // 1. Connect to DB to clean up previous test user
        // Using the same URI as in .env
        await mongoose.connect('mongodb://127.0.0.1:27017/aims');
        await User.deleteOne({ email: TEST_EMAIL });
        console.log('[CLEANUP] Deleted old test user.');

        // 2. Register User
        console.log('[ACTION] Registering User...');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'OTP Test User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                department: 'CSE',
                degree: 'B.Tech',
                yearOfEntry: '2024',
                rollNumber: '2024CSB1001'
            });
            console.log('[SUCCESS] Registration complete.');
        } catch (e) {
            console.error('[ERROR] Registration Failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 3. Login (Should trigger OTP)
        console.log('[ACTION] Logging in...');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

            console.log('[INFO] Login Response:', res.data);

            if (res.data.step === '2fa_required') {
                console.log('[PASS] Server requested 2FA.');
                if (res.data.message === 'OTP sent to your email') {
                    console.log('[PASS] Server confirms OTP sent.');
                } else {
                    console.warn('[WARN] Unexpected message:', res.data.message);
                }
            } else if (res.data.token) {
                console.error('[FAIL] Server skipped 2FA and returned token immediately.');
                console.log('User Role:', res.data.user?.role);
            } else {
                console.error('[FAIL] Unknown response structure.');
            }

        } catch (e) {
            console.error('[ERROR] Login Failed:', e.response?.data || e.message);
        }

        // 4. Verify Database State
        const user = await User.findOne({ email: TEST_EMAIL });
        if (user) {
            console.log(`[DB CHECK] User found: ${user.email}`);
            console.log(`[DB CHECK] OTP in DB: ${user.otp}`);
            console.log(`[DB CHECK] OTP Expires: ${new Date(user.otpExpires).toLocaleString()}`);

            if (user.otp) {
                console.log('[PASS] OTP is correctly stored in database.');
            } else {
                console.error('[FAIL] OTP is MISSING from database.');
            }
        } else {
            console.error('[FAIL] User not found in DB.');
        }

        mongoose.disconnect();

    } catch (err) {
        console.error('[CRITICAL] Script Failed:', err);
    }
}

// We need to run this while server is running, so in this script we won't start the server.
// The Agent will start the server first, then run this.
verifyOtpFlow();
