import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    CircularProgress,
    Chip,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    Fade
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpTab from '../../components/HelpTab';

import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Float Form State
    const [floatData, setFloatData] = useState({
        code: '',
        title: '',
        department: '',
        lecture: 3,
        tutorial: 0,
        practical: 0,
        credits: 4,
        semester: 'I',
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch pending requests for me
            const pendingRes = await api.get('/courses/instructor/pending');
            setPendingRequests(pendingRes.data);

            // Fetch all courses and filter for "my courses" (optimization: backend endpoint would be better)
            const coursesRes = await api.get('/courses');
            const mine = coursesRes.data.filter(c => 
                (c.instructor._id === user._id) || 
                (c.instructor === user._id)
            );
            setMyCourses(mine);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/courses/instructor/approve/${id}`, { action });
            setMessage({ type: 'success', text: `Request ${action === 'approve' ? 'forwarded to FA' : 'rejected'} successfully` });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/course-details/${courseId}`);
    };



    const handleFloatSubmit = async () => {
        if (!floatData.code || !floatData.title || !floatData.department) {
            return setMessage({ type: 'error', text: 'Please fill required fields' });
        }
        try {
            await api.post('/courses/float', {
                ...floatData,
                credits: { 
                    lecture: floatData.lecture,
                    tutorial: floatData.tutorial,
                    practical: floatData.practical,
                    total: floatData.credits 
                }
            });
            setMessage({ type: 'success', text: 'Course floated successfully!' });
            // Reset form
             setFloatData({
                code: '',
                title: '',
                department: '',
                lecture: 3,
                tutorial: 0,
                practical: 0,
                credits: 4,
                semester: 'I',
                year: new Date().getFullYear().toString()
            });
            fetchData();
            setActiveTab(1); // Switch to My Courses tab
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to float course' });
        }
    };

    const handleFloatChange = (e) => setFloatData({ ...floatData, [e.target.name]: e.target.value });

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Fade in={true} timeout={600}>
                <Box>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            mb: 3,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Faculty Dashboard
                    </Typography>

                    <Paper 
                        elevation={0}
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                        }}
                    >
                        <Tabs 
                            value={activeTab} 
                            onChange={handleTabChange} 
                            variant="fullWidth"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                },
                            }}
                        >
                            <Tab icon={<AssignmentIcon />} label="Pending Requests" sx={{ fontWeight: 600 }} />
                            <Tab icon={<ClassIcon />} label="My Floated Courses" sx={{ fontWeight: 600 }} />
                            <Tab icon={<AddCircleIcon />} label="Float New Course" sx={{ fontWeight: 600 }} />
                            <Tab icon={<HelpIcon />} label="Help" sx={{ fontWeight: 600 }} />
                            <Tab icon={<PersonIcon />} label="Profile" sx={{ fontWeight: 600 }} />
                        </Tabs>
                    </Paper>

                    {message.text && (
                        <Fade in={true}>
                            <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                                {message.text}
                            </Alert>
                        </Fade>
                    )}

                    {/* Tab 0: Pending Requests */}
                    {activeTab === 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Pending Student Requests</Typography>
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                    overflow: 'hidden',
                                }}
                            >
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)' }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Entry No.</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pendingRequests.map((req) => (
                                                <TableRow 
                                                    key={req._id}
                                                    sx={{ 
                                                        '&:hover': { 
                                                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                        },
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 600 }}>{req.student?.name}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={req.course?.code}
                                                            size="small"
                                                            sx={{ fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.12)' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{req.student?.rollNumber}</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Button 
                                                                size="small" 
                                                                variant="contained"
                                                                color="success" 
                                                                onClick={() => handleAction(req._id, 'approve')}
                                                                sx={{ minWidth: 90, fontWeight: 600 }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined"
                                                                color="error" 
                                                                onClick={() => handleAction(req._id, 'reject')}
                                                                sx={{ minWidth: 90, fontWeight: 600 }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {pendingRequests.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                        <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                                                            No pending requests.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}

                    {/* Tab 1: My Courses */}
                    {activeTab === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                My Floated Courses
                            </Typography>
                            
                            {myCourses.length === 0 ? (
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 4, 
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.98)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                    }}
                                >
                                    <Typography color="textSecondary" sx={{ fontWeight: 500 }}>
                                        You haven't floated any courses yet.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.98)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)' }}>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course Code</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Course Title</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Department</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Credits</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Semester</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {myCourses.map((course, index) => (
                                                    <TableRow 
                                                        key={course._id}
                                                        sx={{ 
                                                            '&:hover': { 
                                                                bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                                cursor: 'pointer',
                                                            },
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Chip 
                                                                label={course.code}
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 700,
                                                                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                                                    color: 'primary.dark',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>{course.title}</TableCell>
                                                        <TableCell sx={{ color: 'text.secondary' }}>{course.department}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={`${course.credits?.total || 0}`}
                                                                size="small"
                                                                color="secondary"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'text.secondary' }}>{course.semester}</TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                endIcon={<VisibilityIcon />}
                                                                onClick={() => handleViewCourse(course._id)}
                                                                sx={{ 
                                                                    transition: 'all 0.3s ease',
                                                                    textTransform: 'none',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {/* Tab 2: Float Course Form */}
                    {activeTab === 2 && (
                        <Container maxWidth="sm">
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 4,
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                }}
                            >
                        <Typography variant="h6" gutterBottom>Float New Course</Typography>
                         <Box component="form" sx={{ mt: 2 }}>
                            <TextField fullWidth margin="dense" label="Course Code" name="code" value={floatData.code} onChange={handleFloatChange} required />
                            <TextField fullWidth margin="dense" label="Course Title" name="title" value={floatData.title} onChange={handleFloatChange} required />
                            
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department"
                                    value={floatData.department}
                                    label="Department"
                                    onChange={handleFloatChange}
                                >
                                    <MenuItem value="CSE">Computer Science and Engineering</MenuItem>
                                    <MenuItem value="ECE">Electronics and Communication Engineering</MenuItem>
                                    <MenuItem value="ME">Mechanical Engineering</MenuItem>
                                    <MenuItem value="Civil">Civil Engineering</MenuItem>
                                    <MenuItem value="CHE">Chemical Engineering</MenuItem>
                                    <MenuItem value="Biotech">Biotechnology</MenuItem>
                                    <MenuItem value="Math">Mathematics</MenuItem>
                                    <MenuItem value="HSS">Humanities and Social Sciences</MenuItem>
                                </Select>
                            </FormControl>

                            <Box display="flex" gap={1}>
                                <TextField fullWidth margin="dense" label="L" name="lecture" type="number" value={floatData.lecture} onChange={handleFloatChange} />
                                <TextField fullWidth margin="dense" label="T" name="tutorial" type="number" value={floatData.tutorial} onChange={handleFloatChange} />
                                <TextField fullWidth margin="dense" label="P" name="practical" type="number" value={floatData.practical} onChange={handleFloatChange} />
                                <TextField fullWidth margin="dense" label="Total Credits" name="credits" type="number" value={floatData.credits} onChange={handleFloatChange} required />
                            </Box>
                            
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Session Type</InputLabel>
                                <Select
                                    name="semester"
                                    value={floatData.semester}
                                    label="Session Type"
                                    onChange={handleFloatChange}
                                >
                                    <MenuItem value="I">Semester I (Monsoon)</MenuItem>
                                    <MenuItem value="II">Semester II (Winter)</MenuItem>
                                    <MenuItem value="Summer">Summer Session</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField fullWidth margin="dense" label="Academic Year" name="year" value={floatData.year} onChange={handleFloatChange} required helperText="e.g. 2026" />
                            
                            <Button fullWidth variant="contained" size="large" onClick={handleFloatSubmit} sx={{ mt: 3 }}>
                                Float Course
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Tab 3: Help */}
            {activeTab === 3 && (
                <HelpTab />
            )}

                    {/* Tab 4: Profile */}
                    {activeTab === 4 && (
                        <Container maxWidth="sm">
                            <Card 
                                elevation={0}
                                sx={{ 
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.98)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                }}
                            >
                        <CardContent sx={{ textAlign: 'center', py: 5 }}>
                            <Avatar 
                                src={user.pfp} 
                                sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }} 
                            />
                            <Typography variant="h5" fontWeight="bold">{user.name.toUpperCase()}</Typography>
                            <Typography color="textSecondary" gutterBottom>{user.role.toUpperCase()}</Typography>
                            <Box mt={3} textAlign="left">
                                <Typography><strong>EMAIL:</strong> {user.email}</Typography>
                                <Typography sx={{ mt: 1 }}><strong>DEPARTMENT:</strong> {user.department || 'N/A'}</Typography>
                                {user.rollNumber && <Typography sx={{ mt: 1 }}><strong>ENTRY NO:</strong> {user.rollNumber}</Typography>}
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default FacultyDashboard;
