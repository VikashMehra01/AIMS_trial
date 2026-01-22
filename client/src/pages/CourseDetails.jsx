import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Divider,
    Fade,
    IconButton,
    Switch,
    FormControlLabel,
    TextField
} from '@mui/material';
import {
    ArrowBack,
    Refresh,
    CheckCircle,
    Cancel,
    School,
    Person,
    CalendarMonth,
    Settings
} from '@mui/icons-material';
import api from '../utils/api';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Enrollment Settings State
    const [enrollmentSettings, setEnrollmentSettings] = useState({
        isEnrollmentOpen: true,
        enrollmentDeadline: ''
    });

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const courseRes = await api.get(`/courses/${courseId}`);
            setCourse(courseRes.data);

            // Set initial settings from course data
            setEnrollmentSettings({
                isEnrollmentOpen: courseRes.data.isEnrollmentOpen !== false, // default true
                enrollmentDeadline: courseRes.data.enrollmentDeadline ? courseRes.data.enrollmentDeadline.split('T')[0] : ''
            });

            const regRes = await api.get(`/courses/${courseId}/registrations`);
            setRegistrations(regRes.data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load course details' });
        } finally {
            setLoading(false);
        }
    };

    const updateEnrollmentSettings = async (key, value) => {
        // Optimistic update
        setEnrollmentSettings(prev => ({ ...prev, [key]: value }));

        try {
            const payload = {
                [key]: value
            };
            await api.put(`/courses/${courseId}/enrollment-status`, payload);
            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update settings' });
            // Revert on error
            fetchCourseDetails();
        }
    };

    const handleAction = async (regId, action) => {
        try {
            await api.put(`/courses/instructor/approve/${regId}`, { action });
            setMessage({
                type: 'success',
                text: `Student ${action === 'approve' ? 'approved' : 'rejected'} successfully`
            });
            fetchCourseDetails();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Course not found</Alert>
            </Container>
        );
    }

    const approvedCount = registrations.filter(r => r.status === 'Approved').length;
    const pendingCount = registrations.filter(r => r.status === 'Pending_Instructor').length;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={true} timeout={600}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                flex: 1,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Course Details
                        </Typography>
                        <Button
                            startIcon={<Refresh />}
                            onClick={fetchCourseDetails}
                            variant="outlined"
                        >
                            Refresh
                        </Button>
                    </Box>

                    {message.text && (
                        <Fade in={true}>
                            <Alert severity={message.type} sx={{ mb: 3 }}>
                                {message.text}
                            </Alert>
                        </Fade>
                    )}

                    {/* Course Info Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 3,
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                            }}>
                                <School sx={{ fontSize: 40 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    {course.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip label={course.code} color="primary" sx={{ fontWeight: 600 }} />
                                    <Chip label={course.department} variant="outlined" />
                                    <Chip
                                        label={`${course.credits?.total || 0} Credits`}
                                        color="secondary"
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Lecture-Tutorial-Practical
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {course.credits?.lecture}-{course.credits?.tutorial}-{course.credits?.practical}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Semester
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {course.semester}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Academic Year
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {course.year}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Enrolled
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        {approvedCount} Students
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {pendingCount > 0 && (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                You have {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
                            </Alert>
                        )}
                    </Paper>

                    {/* Enrollment Settings (Instructor Only) */}
                    {(course.instructor._id === user?._id || course.instructor === user?._id) && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mb: 3,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(99, 102, 241, 0.1)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Settings sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Enrollment Settings
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={enrollmentSettings.isEnrollmentOpen}
                                                onChange={(e) => updateEnrollmentSettings('isEnrollmentOpen', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography>
                                                Enrollment Status:
                                                <Box component="span" sx={{ fontWeight: 'bold', ml: 1, color: enrollmentSettings.isEnrollmentOpen ? 'success.main' : 'error.main' }}>
                                                    {enrollmentSettings.isEnrollmentOpen ? 'OPEN' : 'CLOSED'}
                                                </Box>
                                            </Typography>
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Enrollment Deadline"
                                        type="date"
                                        value={enrollmentSettings.enrollmentDeadline}
                                        onChange={(e) => updateEnrollmentSettings('enrollmentDeadline', e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {/* Students Table */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ p: 3, bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Student Registrations
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Entry No.</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registrations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <Typography color="textSecondary">
                                                    No students registered yet
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        registrations.map((reg) => (
                                            <TableRow
                                                key={reg._id}
                                                sx={{
                                                    '&:hover': {
                                                        bgcolor: 'rgba(99, 102, 241, 0.04)',
                                                        transition: 'background-color 0.3s ease'
                                                    }
                                                }}
                                            >
                                                <TableCell>{reg.student?.rollNumber}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                        {reg.student?.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{reg.student?.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={reg.status.replace(/_/g, ' ')}
                                                        size="small"
                                                        color={
                                                            reg.status === 'Approved' ? 'success' :
                                                                reg.status === 'Rejected' ? 'error' :
                                                                    'warning'
                                                        }
                                                        sx={{ fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {reg.status === 'Pending_Instructor' && (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<CheckCircle />}
                                                                onClick={() => handleAction(reg._id, 'approve')}
                                                                sx={{
                                                                    minWidth: 100,
                                                                    transition: 'all 0.3s ease',
                                                                }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<Cancel />}
                                                                onClick={() => handleAction(reg._id, 'reject')}
                                                                sx={{
                                                                    minWidth: 100,
                                                                    transition: 'all 0.3s ease',
                                                                }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
};

export default CourseDetails;
