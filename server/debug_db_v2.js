const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aims';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Email: ${u.email} | Role: ${u.role}`);
        });
        console.log('-----------------');

        const courses = await Course.find({});
        console.log('--- ALL COURSES ---');
        courses.forEach(c => {
            console.log(`ID: ${c._id} | Code: ${c.code} | Year: ${c.year} | InstructorRef: ${c.instructor}`);
        });

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
