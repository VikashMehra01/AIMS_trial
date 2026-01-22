const axios = require('axios');
const mongoose = require('mongoose');

// Register a student programmatically to ensure we have credentials
async function registerStudent() {
    try {
        const res = await axios.post('http://localhost:5000/auth/register', {
            name: 'Test Student',
            email: '2025csb9999@iitrpr.ac.in', // Starts with number -> Student
            password: 'password', // Known password
            rollNumber: '2025CSB9999',
            department: 'CSE',
            degree: 'B.Tech',
            yearOfEntry: '2025'
        });
        console.log('Registered Student:', res.data);
    } catch (e) {
        console.log('Registration Error (might already exist):', e.response?.data?.msg || e.message);
    }
}

registerStudent();
