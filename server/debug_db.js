const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aims';

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`);
        });
        console.log('-----------------');

        const courses = await require('./models/Course').find({});
        console.log('--- ALL COURSES ---');
        courses.forEach(c => {
            console.log(`Code: ${c.code} | Year: ${c.year} | Instructor: ${c.instructor}`);
        });

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
