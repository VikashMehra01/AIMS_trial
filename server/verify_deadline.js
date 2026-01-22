const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User'); // Required if Course references User
require('dotenv').config();

// MOCK CONSTANT
const INSTRUCTOR_ID = new mongoose.Types.ObjectId();

async function verifyDefaultDeadline() {
    console.log('--- VERIFYING DEFAULT DEADLINE ---');
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aims_db');

        // Create Test Course WITHOUT specific deadline
        const course = new Course({
            code: 'DEFAULT_TEST_' + Date.now(),
            title: 'Audit Test Course',
            department: 'CSE',
            instructor: INSTRUCTOR_ID,
            credits: { total: 4 },
            semester: 'I',
            year: '2026'
        });

        await course.save();

        console.log(`[CHECK] Course Created: ${course.code}`);
        console.log(`[CHECK] Enrollment Deadline: ${course.enrollmentDeadline}`);

        if (course.enrollmentDeadline) {
            const daysDiff = (new Date(course.enrollmentDeadline) - new Date()) / (1000 * 60 * 60 * 24);
            console.log(`[INFO] Days until deadline: ${daysDiff.toFixed(2)}`);

            if (daysDiff > 6.9 && daysDiff < 7.1) {
                console.log('[PASS] Default deadline is approximately 7 days from now.');
            } else {
                console.error('[FAIL] Default deadline is NOT 7 days.');
            }
        } else {
            console.error('[FAIL] No default deadline set.');
        }

        // Cleanup
        await Course.findByIdAndDelete(course._id);
        console.log('--- VERIFICATION COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('TEST CRASHED:', err);
        process.exit(1);
    }
}

verifyDefaultDeadline();
