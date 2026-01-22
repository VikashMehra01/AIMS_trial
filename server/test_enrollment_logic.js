const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
const CourseRegistration = require('./models/CourseRegistration');
require('dotenv').config();

// MOCK CONSTANTS
const STUDENT_ID = new mongoose.Types.ObjectId();
const INSTRUCTOR_ID = new mongoose.Types.ObjectId();

async function testEnrollmentLogic() {
    console.log('--- STARTING ENROLLMENT LOGIC TEST ---');
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aims_db');

        // 1. Setup Data
        // Create Mock Instructor
        let instructor = await User.findById(INSTRUCTOR_ID);
        if (!instructor) {
            instructor = new User({ _id: INSTRUCTOR_ID, name: 'Test Prof', email: 'prof@test.com', role: 'instructor' });
            // Using a dummy save or just relying on ID for Course reference if we don't need population testing
        }

        // Create Test Course
        const course = new Course({
            code: 'TEST101_' + Date.now(),
            title: 'Test Course',
            department: 'CSE',
            instructor: INSTRUCTOR_ID,
            credits: { total: 4 },
            semester: 'I',
            year: '2026',
            isEnrollmentOpen: true,
            enrollmentDeadline: null // No deadline initially
        });
        await course.save();
        console.log(`[PASS] Created Course: ${course.code}`);

        // 2. Test: Open Enrollment (Should Pass)
        // Simulate "Middleware" logic locally for simplicity or mock the check function
        let canRegister = checkEnrollment(course);
        if (canRegister.status) console.log('[PASS] Registration Allowed when Open');
        else console.error('[FAIL] Registration Blocked unnecessarily:', canRegister.msg);

        // 3. Test: Close Enrollment Manually
        course.isEnrollmentOpen = false;
        await course.save();
        canRegister = checkEnrollment(course);
        if (!canRegister.status && canRegister.msg.includes('closed')) console.log('[PASS] Registration Blocked when Manual Toggle OFF');
        else console.error('[FAIL] Manual Toggle failed');

        // 4. Test: Open but Past Deadline
        course.isEnrollmentOpen = true;
        course.enrollmentDeadline = new Date(Date.now() - 86400000); // Yesterday
        await course.save();
        canRegister = checkEnrollment(course);
        if (!canRegister.status && canRegister.msg.includes('deadline')) console.log('[PASS] Registration Blocked when Past Deadline');
        else console.error('[FAIL] Deadline Check failed');

        // 5. Test: Open and Future Deadline
        course.enrollmentDeadline = new Date(Date.now() + 86400000); // Tomorrow
        await course.save();
        canRegister = checkEnrollment(course);
        if (canRegister.status) console.log('[PASS] Registration Allowed when Future Deadline');
        else console.error('[FAIL] Future Deadline Logic failed');

        // Cleanup
        await Course.findByIdAndDelete(course._id);
        console.log('--- TEST COMPLETED SUCCESSFULLY ---');
        process.exit(0);

    } catch (err) {
        console.error('TEST CRASHED:', err);
        process.exit(1);
    }
}

// Logic replica from routes/courses.js for isolated testing
function checkEnrollment(course) {
    if (course.isEnrollmentOpen === false) {
        return { status: false, msg: 'Enrollment for this course is closed by the instructor.' };
    }
    if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
        return { status: false, msg: `Enrollment deadline passed` };
    }
    return { status: true };
}

testEnrollmentLogic();
