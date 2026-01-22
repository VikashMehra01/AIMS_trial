const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const User = require('../models/User');

// Middleware to verify JWT
const auth = (req, res, next) => {
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

// Middleware to check role
const checkRole = (roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!roles.includes(user.role)) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/courses
// @desc    Get all available courses
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name');
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:id
// @desc    Get course details by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (err) {
        // If ID is invalid ObjectID, it throws error
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Course not found' });
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses/float
// @desc    Float a new course
// @access  Instructor only
router.post('/float', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { code, title, department, credits, semester, year, enrollmentDeadline } = req.body;

        const newCourse = new Course({
            code,
            title,
            department,
            instructor: req.user.id,
            credits,
            semester,
            year,
            enrollmentDeadline: enrollmentDeadline || null,
            isEnrollmentOpen: true // Always open by default when floated
        });

        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses/register
// @desc    Student registers for a course
// @access  Student
router.post('/register', auth, checkRole(['student']), async (req, res) => {
    try {
        const { courseId, type } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Check Enrollment Status
        if (course.isEnrollmentOpen === false) {
            return res.status(400).json({ msg: 'Enrollment for this course is closed by the instructor.' });
        }

        if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
            return res.status(400).json({ msg: `Enrollment deadline passed on ${new Date(course.enrollmentDeadline).toDateString()}` });
        }

        const alreadyRegistered = await CourseRegistration.findOne({
            student: req.user.id,
            course: courseId
        });

        if (alreadyRegistered) {
            return res.status(400).json({ msg: 'Already registered for this course' });
        }

        const registration = new CourseRegistration({
            student: req.user.id,
            course: courseId,
            type
        });

        await registration.save();
        res.json(registration);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/my-registrations
// @desc    Get student's registrations
// @access  Student
router.get('/my-registrations', auth, async (req, res) => {
    try {
        const registrations = await CourseRegistration.find({ student: req.user.id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .populate('student', 'name rollNumber');
        res.json(registrations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/instructor/pending
// @desc    Get pending registrations for instructor's courses
// @access  Instructor
router.get('/instructor/pending', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        // Find courses taught by this instructor
        const myCourses = await Course.find({ instructor: req.user.id });
        const courseIds = myCourses.map(c => c._id);

        // Find pending registrations for these courses
        const pending = await CourseRegistration.find({
            course: { $in: courseIds },
            status: 'Pending_Instructor'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }

});

// @route   GET /api/courses/:courseId
// @desc    Get a specific course by ID
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/:courseId/registrations
// @desc    Get all registrations for a specific course (for the instructor)
// @access  Instructor
router.get('/:courseId/registrations', auth, checkRole(['instructor', 'faculty_advisor', 'student']), async (req, res) => {
    try {
        console.log('GET /:courseId/registrations request');
        console.log('Params:', req.params);
        console.log('User:', req.user.id);

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            console.log('Course not found');
            return res.status(404).json({ msg: 'Course not found' });
        }
        console.log('Course Instructor:', course.instructor);

        // Verify permissions
        // Instructors can only see their own courses
        if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to view this course registrations' });
        }
        // Students can see registrations for courses they are exploring or enrolled in (open for now based on requirement)


        const registrations = await CourseRegistration.find({ course: req.params.courseId })
            .populate('student', 'name rollNumber email department')
            .sort({ 'student.rollNumber': 1 }); // Sort by roll number

        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/instructor/approve/:id
// @desc    Instructor approves/rejects registration
// @access  Instructor
router.put('/instructor/approve/:id', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        const registration = await CourseRegistration.findById(req.params.id);

        if (!registration) return res.status(404).json({ msg: 'Registration not found' });

        if (action === 'approve') {
            registration.status = 'Pending_FA'; // Move to FA approval
            registration.approvedByInstructor = true;
        } else {
            registration.status = 'Rejected';
        }

        await registration.save();
        res.json(registration);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/courses/fa/pending
// @desc    Get pending registrations for FA
// @access  Faculty Advisor
router.get('/fa/pending', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        // In real app, we'd filter by students assigned to this FA. 
        // For now, we'll fetch ALL 'Pending_FA' requests.
        const pending = await CourseRegistration.find({
            status: 'Pending_FA'
        }).populate('student', 'name rollNumber').populate('course', 'code title');

        res.json(pending);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/fa/approve/:id
// @desc    FA approves/rejects registration
// @access  Faculty Advisor
router.put('/fa/approve/:id', auth, checkRole(['faculty_advisor']), async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        const registration = await CourseRegistration.findById(req.params.id);

        if (!registration) return res.status(404).json({ msg: 'Registration not found' });

        if (action === 'approve') {
            registration.status = 'Approved';
            registration.approvedByFA = true;
        } else {
            registration.status = 'Rejected';
        }

        await registration.save();
        res.json(registration);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/courses/:id
// @desc    Update a course (Admin only)
// @access  Admin
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        const { code, title, department, credits, semester, year, instructor } = req.body;

        // Find and update
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        if (code) course.code = code;
        if (title) course.title = title;
        if (department) course.department = department;
        if (credits) course.credits = credits;
        if (semester) course.semester = semester;
        if (year) course.year = year;
        if (instructor) course.instructor = instructor;

        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/courses/:id/enrollment-status
// @desc    Update enrollment availability (Instructor)
// @access  Instructor
router.put('/:id/enrollment-status', auth, checkRole(['instructor', 'faculty_advisor']), async (req, res) => {
    try {
        const { isEnrollmentOpen, enrollmentDeadline } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Verify ownership
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to manage this course' });
        }

        if (isEnrollmentOpen !== undefined) course.isEnrollmentOpen = isEnrollmentOpen;
        if (enrollmentDeadline !== undefined) course.enrollmentDeadline = enrollmentDeadline;

        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course (Admin only)
// @access  Admin
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        // First delete all registrations for this course
        await CourseRegistration.deleteMany({ course: req.params.id });

        // Then delete the course
        const result = await Course.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ msg: 'Course not found' });

        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
