const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Middleware to verify token (Simplified)
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Get All Courses
router.get('/courses', auth, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create Course (Admin only - simplified for now)
router.post('/courses', auth, async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Submit Feedback
router.post('/feedback', auth, async (req, res) => {
    try {
        const newFeedback = new Feedback({
            ...req.body,
            student: req.user.id
        });
        const feedback = await newFeedback.save();
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Check Active Feedback
router.get('/feedback/active', auth, async (req, res) => {
    try {
        // Mock logic: randomly return active or return based on a query
        // In real app, this would check dates or admin settings
        res.json({ active: true, type: 'Mid-Semester', semester: 'Sem-1, 2024-25' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Feedback (Admin)
router.get('/feedback', auth, async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('student', 'name email rollNumber')
            .populate('courseId', 'code title')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Student Record (Mock data for now mostly)
router.get('/student-record', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        // Mock academic history
        const academicHistory = [
            { sNo: 1, course: 'CS101 - Intro to Programming', status: 'Completed', category: 'Core', grade: 'A', attendance: '95%' },
            { sNo: 2, course: 'MA101 - Calculus', status: 'Completed', category: 'Core', grade: 'B+', attendance: '88%' },
            { sNo: 3, course: 'PH101 - Physics', status: 'Ongoing', category: 'Core', grade: 'Pending', attendance: '92%' },
        ];
        res.json({ student: user, history: academicHistory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
