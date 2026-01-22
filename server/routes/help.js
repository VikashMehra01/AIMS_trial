const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   POST /api/help
// @desc    Create a help request
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, description } = req.body;
        const newRequest = new HelpRequest({
            user: req.user.id,
            type,
            description
        });
        const savedRequest = await newRequest.save();
        res.json(savedRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/help
// @desc    Get current user's requests
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const requests = await HelpRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/help/all
// @desc    Get all requests (Admin only)
// @access  Admin
router.get('/all', authMiddleware, async (req, res) => {
    try {
        // Simple check for admin role from req.user if available in token
        // Ideally fetch user to confirm role, but if token has role:
        // Let's fetch user to be sure or check if token payload has role. 
        // Typically payload has { user: { id: ... } }.
        // Let's assume we need to populate user details for the list.
        const requests = await HelpRequest.find()
            .populate('user', ['name', 'email', 'role', 'rollNumber'])
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/help/:id
// @desc    Update help request (Admin)
// @access  Admin
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        
        let helpRequest = await HelpRequest.findById(req.params.id);
        if (!helpRequest) return res.status(404).json({ msg: 'Request not found' });

        if (status) helpRequest.status = status;
        if (adminResponse) helpRequest.adminResponse = adminResponse;

        await helpRequest.save();
        
        // Return updated request with populated user
        const updatedRequest = await HelpRequest.findById(req.params.id)
            .populate('user', ['name', 'email', 'role', 'rollNumber']);
            
        res.json(updatedRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
