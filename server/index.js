require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Passport Config
require('./passport')(passport);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5174',
      process.env.CLIENT_URL
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check strict allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Dynamic verification for Vercel deployments (previews & production)
    // Matches: https://aims-vikash-mehras-projects-*.vercel.app
    const vercelRegex = /^https:\/\/aims-vikash-mehras-projects-.*\.vercel\.app$/;
    if (vercelRegex.test(origin)) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 🔹 SESSION MIDDLEWARE (MUST come before passport.session)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// 🔹 PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// DB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Check Connection Error:', err.message); // Log the actual error
    console.log('Failed to connect to local MongoDB. Trying In-Memory Database...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('CONNECTED TO IN-MEMORY MONGODB (Data will be lost on restart)');
    } catch (innerErr) {
      console.error('Failed to connect to both local and in-memory DB:', innerErr);
    }
  }
};

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api', require('./routes/api'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/help', require('./routes/help'));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
