const mongoose = require('mongoose');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    const collection = mongoose.connection.collection('courses');
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes);

    const problemIndex = indexes.find(idx => idx.name === 'courseCode_1');
    if (problemIndex) {
      console.log('Found problematic index: courseCode_1. Dropping it...');
      await collection.dropIndex('courseCode_1');
      console.log('Index dropped successfully.');
    } else {
      console.log('Problematic index courseCode_1 not found.');
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

fixIndex();
