const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const testUser = {
    name: "Test User Verification",
    rollNumber: `${Date.now()}`,
    email: `testuser${Date.now()}@example.com`,
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2023"
};

async function testRegisterOnly() {
    try {
        console.log('Testing Registration with data:');
        console.log(JSON.stringify(testUser, null, 2));
        console.log('\nSending POST request to:', `${API_URL}/register`);

        const regRes = await axios.post(`${API_URL}/register`, testUser);

        console.log('\n✅ SUCCESS: Registration worked!');
        console.log('Response:', JSON.stringify(regRes.data, null, 2));

    } catch (error) {
        console.log('\n❌ FAILURE: Registration failed');

        if (error.response) {
            console.log('Status Code:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
            console.log('Response Headers:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            console.log('No response received');
            console.log('Request was:', error.request);
        } else {
            console.log('Error:', error.message);
        }

        if (error.stack) {
            console.log('\nStack trace:', error.stack);
        }
    }
}

testRegisterOnly();
