const axios = require('axios');

const API_URL = 'http://localhost:5000/auth';

const studentUser = {
    name: "Test Student",
    rollNumber: "2023CSB1111",
    email: "2023csb1111@iitrpr.ac.in",
    password: "password123",
    department: "CSE",
    degree: "B.Tech",
    yearOfEntry: "2023"
};

const instructorUser = {
    name: "Test Instructor",
    rollNumber: "INST111",
    email: "prof.turing@iitrpr.ac.in",
    password: "password123",
    department: "CSE",
    degree: "Ph.D",
    yearOfEntry: "2010"
};

const facultyAdvisorUser = {
    name: "Test Faculty Advisor",
    rollNumber: "FA999",
    email: "facultyadvisor@iitrpr.ac.in",
    password: "password123",
    department: "CSE",
    degree: "Ph.D",
    yearOfEntry: "2010"
};

async function testRoles() {
    console.log('--- Testing Role Assignment ---');

    // Test 1: Student Role
    try {
        console.log(`[1] Registering Student: ${studentUser.email}`);
        await axios.post(`${API_URL}/register`, studentUser);
        const loginRes = await axios.post(`${API_URL}/login`, { email: studentUser.email, password: studentUser.password });
        console.log(`Note: Login Response Role: ${loginRes.data.user.role}`);
        if (loginRes.data.user.role === 'student') {
            console.log('✅ SUCCESS: Assigned role "student" correctly.');
        } else {
            console.error(`❌ FAILURE: Expected "student", got "${loginRes.data.user.role}"`);
        }
    } catch (error) {
        if (error.response && error.response.data.msg === 'User already exists') {
            console.log('ℹ️ User exists, skipping creation.');
        } else {
            console.error('❌ FAILURE:', error.response?.data || error.message);
        }
    }

    // Test 2: Instructor Role
    try {
        console.log(`[2] Registering Instructor: ${instructorUser.email}`);
        await axios.post(`${API_URL}/register`, instructorUser);
        const loginRes = await axios.post(`${API_URL}/login`, { email: instructorUser.email, password: instructorUser.password });
        if (loginRes.data.user.role === 'instructor') {
            console.log('✅ SUCCESS: Assigned role "instructor" correctly.');
        } else {
            console.error(`❌ FAILURE: Expected "instructor", got "${loginRes.data.user.role}"`);
        }
    } catch (error) {
        if (error.response && error.response.data.msg === 'User already exists') {
            console.log('ℹ️ User exists, skipping creation.');
        } else {
            console.error('❌ FAILURE:', error.response?.data || error.message);
        }
    }

    // Test 3: Faculty Advisor
    try {
        console.log(`[3] Registering Faculty Advisor: ${facultyAdvisorUser.email}`);
        await axios.post(`${API_URL}/register`, facultyAdvisorUser);
        const loginRes = await axios.post(`${API_URL}/login`, { email: facultyAdvisorUser.email, password: facultyAdvisorUser.password });
        if (loginRes.data.user.role === 'faculty_advisor') {
            console.log('✅ SUCCESS: Assigned role "faculty_advisor" correctly.');
        } else {
            console.error(`❌ FAILURE: Expected "faculty_advisor", got "${loginRes.data.user.role}"`);
        }
    } catch (error) {
        if (error.response && error.response.data.msg === 'User already exists') {
            console.log('ℹ️ User exists, skipping creation.');
        } else {
            console.error('❌ FAILURE:', error.response?.data || error.message);
        }
    }
}

testRoles();
