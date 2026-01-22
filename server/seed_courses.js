const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const CourseRegistration = require('./models/CourseRegistration');
const User = require('./models/User');

dotenv.config();

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aims_db');
        console.log('MongoDB Connected');

        // Clear existing data
        await Course.deleteMany({});
        await CourseRegistration.deleteMany({});
        console.log('Cleared existing courses and registrations');

        // Find an instructor
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            console.log('No instructor found. Creating dummy instructor...');
            instructor = new User({
                name: 'Dr. Alan Turing',
                email: 'alan@iitrpr.ac.in',
                password: 'password123', // Won't be hashed here properly but okay for seeding if we don't login with it immediately or if we rely on google auth mainly. 
                // Actually, let's just make sure we can find one. If not, this user is created.
                department: 'CSE',
                role: 'instructor'
            });
            await instructor.save();
        }
        console.log(`Assigning courses to instructor: ${instructor.name} (${instructor._id})`);

        const courses = [
            // Current Session: 2026 - II (Winter)
            {
                code: 'CS302',
                title: 'Operating Systems',
                department: 'CSE',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'II',
                year: '2026'
            },
            {
                code: 'CS304',
                title: 'Computer Networks',
                department: 'CSE',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'II',
                year: '2026'
            },
            {
                code: 'MA202',
                title: 'Probability and Statistics',
                department: 'Math',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 1, practical: 0, total: 4 },
                semester: 'II',
                year: '2026'
            },
            {
                code: 'EE204',
                title: 'Analog Circuits',
                department: 'ECE',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'II',
                year: '2026'
            },
            // Summer Session: 2026 - Summer
            {
                code: 'HS101',
                title: 'Introduction to Economics',
                department: 'HSS',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 0, total: 3 },
                semester: 'Summer',
                year: '2026'
            },
            // Past Session: 2025 - I (Monsoon)
            {
                code: 'CS201',
                title: 'Data Structures and Algorithms',
                department: 'CSE',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'I',
                year: '2025'
            },
             {
                code: 'GE103',
                title: 'Introduction to Computing',
                department: 'CSE',
                instructor: instructor._id,
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'I',
                year: '2025'
            }
        ];

        await Course.insertMany(courses);
        console.log('Added realistic courses!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedCourses();
