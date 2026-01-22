const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const invalidUser = {
    name: "Invalid Domain User",
    rollNumber: "INV123",
    email: "test@gmail.com",
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2024"
};

const validUser = {
    name: "Valid Domain User",
    rollNumber: "VAL123",
    email: "test@iitrpr.ac.in",
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2024"
};

async function testDomainRestriction() {
    console.log('--- Testing Domain Restriction ---');

    // Test 1: Invalid Domain
    try {
        console.log(`[1] Registering invalid email: ${invalidUser.email}`);
        await axios.post(`${API_URL}/register`, invalidUser);
        console.error('❌ FAILURE: Registration should have failed but succeeded.');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.msg === 'Only @iitrpr.ac.in emails are allowed') {
            console.log('✅ SUCCESS: Invalid email blocked correctly.');
        } else {
            console.error('❌ FAILURE: Unexpected error:', error.response?.data || error.message);
        }
    }

    // Test 2: Valid Domain
    try {
        console.log(`[2] Registering valid email: ${validUser.email}`);
        await axios.post(`${API_URL}/register`, validUser);
        console.log('✅ SUCCESS: Valid email registered correctly.');
    } catch (error) {
        if (error.response && error.response.data.msg === 'User already exists') {
            console.log('✅ SUCCESS: Valid user can register (already existed).');
        } else {
            console.error('❌ FAILURE: Valid registration failed:', error.response?.data || error.message);
        }
    }
}

testDomainRestriction();
