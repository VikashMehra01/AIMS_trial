const axios = require('axios');

const AUTH_URL = 'http://localhost:5000/auth';
const COURSE_URL = 'http://localhost:5000/api/courses';

// Users
const instructor = { email: "prof.course@iitrpr.ac.in", password: "password123" };
const student = { email: "2023csb9999@iitrpr.ac.in", password: "password123" };
const fa = { email: "facultyadvisor@iitrpr.ac.in", password: "password123" };

let instructorToken, studentToken, faToken;
let courseId, registrationId;

async function runCourseFlow() {
    console.log('--- Testing Course Management Flow ---');

    // 1. Login all users
    try {
        console.log('[1] Logging in users...');
        // Register if not exist
        try { await axios.post(`${AUTH_URL}/register`, { ...instructor, name: "Prof Course", rollNumber: "INST99", department: "CSE", degree: "PhD", yearOfEntry: "2010" }); } catch (e) { }
        try { await axios.post(`${AUTH_URL}/register`, { ...student, name: "Student Course", rollNumber: "2023CSB9999", department: "CSE", degree: "BTech", yearOfEntry: "2023" }); } catch (e) { }
        try { await axios.post(`${AUTH_URL}/register`, { ...fa, name: "FA Course", rollNumber: "FA99", department: "CSE", degree: "PhD", yearOfEntry: "2010" }); } catch (e) { }

        const iRes = await axios.post(`${AUTH_URL}/login`, instructor);
        instructorToken = iRes.data.token;
        console.log('Instructor Logged In (Role: ' + iRes.data.user.role + ')');

        const sRes = await axios.post(`${AUTH_URL}/login`, student);
        studentToken = sRes.data.token;
        console.log('Student Logged In (Role: ' + sRes.data.user.role + ')');

        const fRes = await axios.post(`${AUTH_URL}/login`, fa);
        faToken = fRes.data.token;
        console.log('FA Logged In (Role: ' + fRes.data.user.role + ')');

    } catch (err) {
        console.error('Login Failed', err.response?.data);
        return;
    }

    // 2. Float Course (Instructor)
    try {
        console.log('\n[2] Floating Course...');
        const res = await axios.post(`${COURSE_URL}/float`, {
            code: `CS${Date.now()}`,
            title: "Advanced AI Agents",
            department: "CSE",
            credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
            semester: "Monsoon 2026",
            year: "2026"
        }, { headers: { 'x-auth-token': instructorToken } });

        courseId = res.data._id;
        console.log('✅ Course Floated: ', res.data.code);
    } catch (err) {
        console.error('Float Failed', err.response?.data);
        return;
    }

    // 3. Register for Course (Student)
    try {
        console.log('\n[3] Student Registering...');
        const res = await axios.post(`${COURSE_URL}/register`, {
            courseId: courseId,
            type: "Credit"
        }, { headers: { 'x-auth-token': studentToken } });

        registrationId = res.data._id;
        console.log('✅ Registered! Status: ', res.data.status);
    } catch (err) {
        console.error('Registration Failed', err.response?.data);
        return;
    }

    // 4. Instructor Approve
    try {
        console.log('\n[4] Instructor Approving...');
        const res = await axios.put(`${COURSE_URL}/instructor/approve/${registrationId}`, {
            action: 'approve'
        }, { headers: { 'x-auth-token': instructorToken } });

        console.log('✅ Instructor Approved! New Status: ', res.data.status);
    } catch (err) {
        console.error('Inst Approval Failed', err.response?.data);
        return;
    }

    // 5. FA Approve
    try {
        console.log('\n[5] FA Approving...');
        const res = await axios.put(`${COURSE_URL}/fa/approve/${registrationId}`, {
            action: 'approve'
        }, { headers: { 'x-auth-token': faToken } });

        console.log('✅ FA Approved! Final Status: ', res.data.status);
    } catch (err) {
        console.error('FA Approval Failed', err.response?.data);
        return;
    }
}

runCourseFlow();
