const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aims');
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        
        // List indexes
        const indexes = await User.collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop rollNumber index if it exists
        try {
            await User.collection.dropIndex('rollNumber_1');
            console.log('Dropped rollNumber_1 index');
        } catch (err) {
            console.log('rollNumber index might not exist or verify name:', err.message);
        }

        // Re-sync indexes (Mongoose does this on model init, but we can force it or just let the app restart)
        // ensureIndexes() is deprecated in favor of createIndexes() or syncIndexes()
        await User.syncIndexes();
        console.log('Synced indexes (recreated strict/sparse indexes)');

        console.log('Done');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndexes();
