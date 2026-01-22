const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const instructorNoRoll = {
    name: "Dr. No Roll",
    // rollNumber skipped
    email: "noroll@iitrpr.ac.in",
    password: "password123",
    department: "Math",
    degree: "Ph.D",
    yearOfEntry: "2015"
};

async function testOptionalRoll() {
    console.log('--- Testing Optional Roll Number ---');

    try {
        console.log(`[1] Registering Instructor without Roll Number: ${instructorNoRoll.email}`);
        await axios.post(`${API_URL}/register`, instructorNoRoll);

        const loginRes = await axios.post(`${API_URL}/login`, { email: instructorNoRoll.email, password: instructorNoRoll.password });
        console.log(`✅ SUCCESS: Registered and Logged in. Role: ${loginRes.data.user.role}`);

        if (loginRes.data.user.rollNumber) {
            console.log(`ℹ️ Roll Number present? : ${loginRes.data.user.rollNumber}`);
        } else {
            console.log('✅ Verified: Roll Number is undefined/null');
        }

    } catch (error) {
        if (error.response && error.response.data.msg === 'User already exists') {
            console.log('ℹ️ User exists, testing login...');
            const loginRes = await axios.post(`${API_URL}/login`, { email: instructorNoRoll.email, password: instructorNoRoll.password });
            console.log(`✅ Logged in existing user. Role: ${loginRes.data.user.role}`);
        } else {
            console.error('❌ FAILURE:', error.response?.data || error.message);
        }
    }
}

testOptionalRoll();
