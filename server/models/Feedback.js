const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseInstructor: { type: String }, // Keep for backward compatibility
    feedbackType: { type: String, enum: ['Mid-sem', 'End-sem', 'Mid-Semester'], required: true },
    content: { type: String }, // Text responses or comments
    ratings: { type: Map, of: mongoose.Schema.Types.Mixed }, // Accept both numbers and strings
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
