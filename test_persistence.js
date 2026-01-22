const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/auth';

const uniqueId = Date.now();
const testUser = {
    name: `Persistence User ${uniqueId}`,
    rollNumber: `P${uniqueId}`,
    email: `persist${uniqueId}@example.com`,
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2024"
};

async function testPersistence() {
    try {
        console.log(`[1] Registering user: ${testUser.email}`);
        await axios.post(`${API_URL}/register`, testUser);
        console.log('✅ User registered successfully.');

        // Save user email to file for next run
        fs.writeFileSync('persistence_test_data.txt', testUser.email);
        console.log('💾 Saved email to persistence_test_data.txt');

    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
    }
}

async function verifyPersistence() {
    try {
        if (!fs.existsSync('persistence_test_data.txt')) {
            console.log('⚠️ No previous test data found. Run registration first.');
            return;
        }

        const email = fs.readFileSync('persistence_test_data.txt', 'utf8');
        console.log(`[2] Verifying user existence: ${email}`);

        // Try to login (since there is no public get-user endpoint without token)
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: email,
            password: "password123"
        });

        if (loginRes.data.token) {
            console.log('✅ SUCCESS: User still exists after restart!');
        } else {
            console.log('❌ FAILURE: Login succeeded but no token?');
        }

    } catch (error) {
        console.error('❌ Login failed (User might be lost):', error.response?.data?.msg || error.message);
    }
}

const mode = process.argv[2];
if (mode === 'register') {
    testPersistence();
} else if (mode === 'verify') {
    verifyPersistence();
} else {
    console.log('Usage: node test_persistence.js [register|verify]');
}
