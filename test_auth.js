const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const testUser = {
    name: "Test User",
    rollNumber: "12345",
    email: `test${Date.now()}@example.com`,
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2023"
};

async function testAuth() {
    try {
        console.log('1. Testing Registration...');
        const regRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('Registration Successful:', regRes.data);

        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Successful:', loginRes.data);

        if (loginRes.data.token) {
            console.log('\nSUCCESS: Auth flow is working correctly on the backend.');
        } else {
            console.log('\nFAILURE: Login did not return a token.');
        }

    } catch (error) {
        console.error('\nFAILURE: API Request Failed');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAuth();
