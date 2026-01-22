const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const testUser = {
    name: "Antigravity Tester",
    rollNumber: "AG123456",
    email: "tester@example.com",
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2024"
};

async function seedUser() {
    try {
        console.log('Attempting to register test user...');
        await axios.post(`${API_URL}/register`, testUser);
        console.log('✅ User registered successfully!');
        console.log('Email: tester@example.com');
        console.log('Password: password123');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.msg === 'User already exists') {
            console.log('ℹ️ User already exists. Good to go!');
            console.log('Email: tester@example.com');
            console.log('Password: password123');
        } else {
            console.error('❌ Failed to register user:', error.message);
            if (error.response) {
                console.error('Response:', error.response.data);
            }
        }
    }
}

seedUser();
