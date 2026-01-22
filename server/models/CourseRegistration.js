const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    type: {
        type: String,
        enum: ['Credit', 'Audit', 'Minor', 'Concentration'],
        default: 'Credit'
    },
    status: {
        type: String,
        enum: ['Pending_Instructor', 'Pending_FA', 'Approved', 'Rejected'],
        default: 'Pending_Instructor'
    },
    approvedByInstructor: { type: Boolean, default: false },
    approvedByFA: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent duplicate registration for same course
courseRegistrationSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);
