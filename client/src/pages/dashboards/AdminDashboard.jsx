import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Avatar,
    Box,
    Chip,
    Tabs,
    Tab,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [helpRequests, setHelpRequests] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Edit User State
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userData, setUserData] = useState({});

    // Edit Course State
    const [editCourseOpen, setEditCourseOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseData, setCourseData] = useState({});

    // Feedback Detail State
    const [feedbackDetailOpen, setFeedbackDetailOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Help Request Detail State
    const [helpDetailOpen, setHelpDetailOpen] = useState(false);
    const [selectedHelp, setSelectedHelp] = useState(null);
    const [adminReply, setAdminReply] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [usersRes, coursesRes, helpRes, feedbackRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/courses'),
                api.get('/help/all'),
                api.get('/feedback')
            ]);
            setUsers(usersRes.data);
            setCourses(coursesRes.data);
            setHelpRequests(helpRes.data);
            setFeedbackList(feedbackRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    // --- User Management ---
    const openEditUser = (user) => {
        setSelectedUser(user);
        setUserData({
            name: user.name,
            email: user.email,
            role: user.role,
            rollNumber: user.rollNumber || '',
            department: user.department || ''
        });
        setEditUserOpen(true);
    };

    const handleUserUpdate = async () => {
        try {
            const res = await api.put(`/admin/users/${selectedUser._id}`, userData);
            setUsers(users.map(u => u._id === selectedUser._id ? res.data : u));
            setMsg({ type: 'success', text: 'User updated successfully' });
            setEditUserOpen(false);
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to update user' });
        }
    };

    // --- Course Management ---
    const deleteCourse = async (id) => {
        if (!window.confirm('Are you sure? This will delete all enrollments linked to this course.')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
            setMsg({ type: 'success', text: 'Course deleted' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to delete course' });
        }
    };

    const openEditCourse = (course) => {
        setSelectedCourse(course);
        setCourseData({
            code: course.code,
            title: course.title,
            department: course.department,
            semester: course.semester,
            year: course.year,
            instructor: course.instructor?._id || course.instructor // Handle populated or ID
        });
        setEditCourseOpen(true);
    };

    const handleCourseUpdate = async () => {
        try {
            const res = await api.put(`/courses/${selectedCourse._id}`, courseData);
            // Updating list locally is tricky due to population, so we refresh
            fetchInitialData();
            setMsg({ type: 'success', text: 'Course updated successfully' });
            setEditCourseOpen(false);
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to update course' });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">Admin Console</Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchInitialData}>Refresh Data</Button>
            </Box>

            {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg({ type: '', text: '' })}>{msg.text}</Alert>}

            <Paper square sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                    <Tab icon={<PeopleIcon />} label="Manage Users" />
                    <Tab icon={<ClassIcon />} label="Manage Courses" />
                    <Tab icon={<HelpCenterIcon />} label="Help Center" />
                    <Tab label="Feedback" />
                </Tabs>
            </Paper>

            {/* Tab 0: Manage Users */}
            {activeTab === 0 && (
                <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#eee' }}>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Entry No.</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar src={user.pfp} sx={{ width: 24, height: 24 }} />
                                            {user.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.role} 
                                            size="small" 
                                            color={user.role === 'admin' ? 'error' : user.role === 'instructor' ? 'primary' : 'default'} 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{user.department || '-'}</TableCell>
                                    <TableCell>{user.rollNumber || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => openEditUser(user)} color="primary"><EditIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tab 1: Manage Courses */}
            {activeTab === 1 && (
                <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#eee' }}>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Session</TableCell>
                                <TableCell>Instructor</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course._id} hover>
                                    <TableCell fontWeight="bold">{course.code}</TableCell>
                                    <TableCell>{course.title}</TableCell>
                                    <TableCell>{course.department}</TableCell>
                                    <TableCell>{course.year} - {course.semester}</TableCell>
                                    <TableCell>{course.instructor?.name || 'Unknown'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => openEditCourse(course)} color="primary"><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => deleteCourse(course._id)} color="error"><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tab 2: Help Center */}
            {activeTab === 2 && (
                <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#eee' }}>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {helpRequests.map((req) => (
                                <TableRow 
                                    key={req._id} 
                                    hover 
                                    onClick={() => {
                                        setSelectedHelp(req);
                                        setAdminReply(req.adminResponse || '');
                                        setHelpDetailOpen(true);
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{req.user?.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{req.user?.email}</Typography>
                                            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>Click to manage →</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={req.user?.role} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{req.type}</TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography noWrap>{req.description}</Typography>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip label={req.status} color={req.status === 'Open' ? 'error' : 'success'} size="small" />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {helpRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No help requests found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tab 3: Feedback */}
            {activeTab === 3 && (
                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">All Feedback Submissions</Typography>
                        <Button startIcon={<RefreshIcon />} onClick={fetchInitialData}>Refresh</Button>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><strong>Student</strong></TableCell>
                                    <TableCell><strong>Course</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Submitted</strong></TableCell>
                                    <TableCell><strong>Responses</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbackList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No feedback submitted yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    feedbackList.map((fb) => (
                                        <TableRow 
                                            key={fb._id} 
                                            hover 
                                            onClick={() => {
                                                setSelectedFeedback(fb);
                                                setFeedbackDetailOpen(true);
                                            }}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{fb.student?.name || 'Anonymous'}</TableCell>
                                            <TableCell>{fb.courseInstructor || fb.courseId?.code || 'N/A'}</TableCell>
                                            <TableCell><Chip label={fb.feedbackType} size="small" /></TableCell>
                                            <TableCell>{new Date(fb.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Box sx={{ fontSize: '0.85rem' }}>
                                                    {fb.content && <div><strong>Comments:</strong> {fb.content.substring(0, 50)}...</div>}
                                                    {fb.ratings && <div><strong>Ratings:</strong> {Object.keys(fb.ratings).length} items</div>}
                                                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>Click to view details →</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Edit User Dialog */}
            <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, minWidth: 300 }}>
                        <TextField fullWidth margin="dense" label="Name" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Role</InputLabel>
                            <Select value={userData.role} label="Role" onChange={e => setUserData({...userData, role: e.target.value})}>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="instructor">Instructor</MenuItem>
                                <MenuItem value="faculty_advisor">Faculty Advisor</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth margin="dense" label="Department" value={userData.department} onChange={e => setUserData({...userData, department: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Entry Number" value={userData.rollNumber} onChange={e => setUserData({...userData, rollNumber: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUserOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUserUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={editCourseOpen} onClose={() => setEditCourseOpen(false)}>
                <DialogTitle>Edit Course</DialogTitle>
                <DialogContent>
                     <Box component="form" sx={{ mt: 1, minWidth: 300 }}>
                        <TextField fullWidth margin="dense" label="Code" value={courseData.code} onChange={e => setCourseData({...courseData, code: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Title" value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Department" value={courseData.department} onChange={e => setCourseData({...courseData, department: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Session (I/II/Summer)" value={courseData.semester} onChange={e => setCourseData({...courseData, semester: e.target.value})} />
                        <TextField fullWidth margin="dense" label="Year" value={courseData.year} onChange={e => setCourseData({...courseData, year: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditCourseOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCourseUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Detail Dialog */}
            <Dialog open={feedbackDetailOpen} onClose={() => setFeedbackDetailOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Feedback Details</Typography>
                        <Chip label={selectedFeedback?.feedbackType} color="primary" size="small" />
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedFeedback && (
                        <Box>
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Student</Typography>
                                    <Typography variant="body1" fontWeight="bold">{selectedFeedback.student?.name || 'Anonymous'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Course</Typography>
                                    <Typography variant="body1" fontWeight="bold">{selectedFeedback.courseInstructor || selectedFeedback.courseId?.title || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Submitted On</Typography>
                                    <Typography variant="body1">{new Date(selectedFeedback.createdAt).toLocaleString()}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">Student Email</Typography>
                                    <Typography variant="body1">{selectedFeedback.student?.email || 'N/A'}</Typography>
                                </Grid>
                            </Grid>

                            {selectedFeedback.ratings && Object.keys(selectedFeedback.ratings).length > 0 && (
                                <Box mb={3}>
                                    <Typography variant="h6" gutterBottom>Responses</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Question</strong></TableCell>
                                                    <TableCell><strong>Response</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                    <TableBody>
                                        {Object.entries(selectedFeedback.ratings).map(([key, value]) => {
                                            // Helper to map legacy keys to full questions
                                            const getQuestionText = (k) => {
                                                const map = {
                                                    'clarity': 'The instructor had command over the subject',
                                                    'pace': 'The instructor was sincere (timely release of grades, etc.)',
                                                    'helpfulness': 'The instructor adapted professional ethics'
                                                };
                                                return map[k] || k;
                                            };
                                            
                                            return (
                                                <TableRow key={key}>
                                                    <TableCell>{getQuestionText(key)}</TableCell>
                                                    <TableCell>{value}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {selectedFeedback.content && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Additional Comments</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedFeedback.content}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFeedbackDetailOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Help Request Detail Dialog */}
            <Dialog open={helpDetailOpen} onClose={() => setHelpDetailOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Manage Help Request</Typography>
                        <Chip 
                            label={selectedHelp?.status} 
                            color={selectedHelp?.status === 'Open' ? 'error' : 'success'} 
                            size="small" 
                        />
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedHelp && (
                        <Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">User Details</Typography>
                                <Typography variant="body1"><strong>{selectedHelp.user?.name}</strong> ({selectedHelp.user?.email})</Typography>
                                <Typography variant="caption" color="textSecondary">{selectedHelp.user?.role} • {selectedHelp.type}</Typography>
                            </Box>
                            
                            <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Description</Typography>
                                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>{selectedHelp.description}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Admin Response / Resolution</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder="Add a comment or resolution note..."
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHelpDetailOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={async () => {
                            try {
                                const res = await api.put(`/help/${selectedHelp._id}`, {
                                    adminResponse: adminReply
                                });
                                setHelpRequests(prev => prev.map(r => r._id === res.data._id ? res.data : r));
                                setMsg({ type: 'success', text: 'Response updated successfully.' });
                            } catch (err) {
                                console.error(err);
                                setMsg({ type: 'error', text: 'Failed to update response.' });
                            }
                        }}
                    >
                        Update
                    </Button>
                    {selectedHelp?.status !== 'Closed' && (
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={async () => {
                                try {
                                    const res = await api.put(`/help/${selectedHelp._id}`, {
                                        status: 'Closed',
                                        adminResponse: adminReply
                                    });
                                    setHelpRequests(prev => prev.map(r => r._id === res.data._id ? res.data : r));
                                    setHelpDetailOpen(false);
                                    setMsg({ type: 'success', text: 'Request updated and closed successfully.' });
                                } catch (err) {
                                    console.error(err);
                                    setMsg({ type: 'error', text: 'Failed to update request.' });
                                }
                            }}
                        >
                            Close Request
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
