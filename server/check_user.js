const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aims_db');
        const user = await User.findOne({ email: '2023csb1095@iitrpr.ac.in' });
        if (user) {
            console.log('User FOUND:', user.email, user.role);
        } else {
            console.log('User NOT FOUND');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
