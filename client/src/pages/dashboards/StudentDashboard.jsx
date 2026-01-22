import React, { useState, useEffect, useContext } from 'react';
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
    Chip,
    Tabs,
    Tab,
    Stack,
    InputAdornment,
    TextField,
    IconButton,
    Tooltip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';


import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';

import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Feedback from '../Feedback';
import HelpTab from '../../components/HelpTab';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollType, setEnrollType] = useState('Credit');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Peer View State
    const [openPeerDialog, setOpenPeerDialog] = useState(false);
    const [peers, setPeers] = useState([]);
    const [peerLoading, setPeerLoading] = useState(false);

    // New State for Redesign
    const [activeTab, setActiveTab] = useState(0); // Default to Student Records
    const [filters, setFilters] = useState({
        department: '',
        code: '',
        title: '',
        semester: '',
        instructor: ''
    });

    // Group Registrations by Semester for Tab 0
    const groupedRegistrations = myRegistrations.reduce((acc, reg) => {
        const key = `${reg.course?.year} - ${reg.course?.semester}`; // e.g., "2026 - I"
        if (!acc[key]) acc[key] = [];
        acc[key].push(reg);
        return acc;
    }, {});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, myRes] = await Promise.all([
                api.get('/courses'),
                api.get('/courses/my-registrations')
            ]);
            setCourses(coursesRes.data);
            setMyRegistrations(myRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        setFilters({
            department: '',
            code: '',
            title: '',
            semester: '',
            instructor: ''
        });
    };

    // Filter Logic
    const currentYear = new Date().getFullYear(); // 2026
    const filteredCourses = courses.filter(course => {
        // Exclude past years (e.g., 2025 and earlier) from Enrollment options
        // Assuming current academic cycle starts 2026.
        return (
            (filters.department === '' || course.department.toLowerCase().includes(filters.department.toLowerCase())) &&
            (filters.code === '' || course.code.toLowerCase().includes(filters.code.toLowerCase())) &&
            (filters.title === '' || course.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.semester === '' || course.semester.toString().includes(filters.semester)) &&
            (filters.instructor === '' || (course.instructor?.name || '').toLowerCase().includes(filters.instructor.toLowerCase()))
        );
    });

    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setOpenDialog(true);
        setMessage({ type: '', text: '' });
    };

    const handleEnrollSubmit = async () => {
        try {
            await api.post('/courses/register', {
                courseId: selectedCourse._id,
                type: enrollType
            });
            setMessage({ type: 'success', text: 'Enrollment request sent!' });
            fetchData(); // Refresh data
            setTimeout(() => setOpenDialog(false), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Enrollment failed' });
        }
    };

    const handleViewPeers = async (course) => {
        setSelectedCourse(course);
        setOpenPeerDialog(true);
        setPeerLoading(true);
        try {
            const res = await api.get(`/courses/${course._id}/registrations`);
            setPeers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setPeerLoading(false);
        }
    };

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'success';
        if (status === 'Rejected') color = 'error';
        if (status.includes('Pending')) color = 'warning';
        return <Chip label={status.replace('_', ' ')} color={color} size="small" />;
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Student Dashboard
            </Typography>

            {/* Tabs Header */}
            <Paper square sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                    <Tab label="Student Records" />
                    <Tab label="Course Enrollment" />
                    <Tab icon={<FeedbackIcon />} label="Feedback" />
                    <Tab icon={<HelpIcon />} label="Help" />
                    <Tab icon={<PersonIcon />} label="Profile" />
                </Tabs>
            </Paper>

            {/* Tab 0: Student Records (Grouped by Semester) */}
            {activeTab === 0 && (
                <Stack spacing={3}>
                    {Object.keys(groupedRegistrations).length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="textSecondary">No records found. Go to "Course Enrollment" to register.</Typography>
                        </Paper>
                    ) : (
                        Object.entries(groupedRegistrations).sort().reverse().map(([session, regs]) => (
                            <Paper key={session} sx={{ p: 0, overflow: 'hidden', border: '1px solid #e0e0e0' }} elevation={0}>
                                <Box p={2} bgcolor="#f8f9fa">
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary">{session}</Typography>
                                </Box>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Course Code</strong></TableCell>
                                                <TableCell><strong>Title</strong></TableCell>
                                                <TableCell><strong>Type</strong></TableCell>
                                                <TableCell><strong>L-T-P-C</strong></TableCell>
                                                <TableCell><strong>Faculty</strong></TableCell>
                                                <TableCell align="center"><strong>Status</strong></TableCell>
                                                <TableCell align="center"><strong>peers</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {regs.map((reg) => {
                                                const c = reg.course;
                                                const ltpc = c.credits ? `${c.credits.lecture}-${c.credits.tutorial}-${c.credits.practical}-${c.credits.total}` : '-';
                                                return (
                                                    <TableRow key={reg._id} hover>
                                                        <TableCell sx={{ fontWeight: 500 }}>{c?.code}</TableCell>
                                                        <TableCell>{c?.title}</TableCell>
                                                        <TableCell><Chip label={reg.type} size="small" variant="outlined" /></TableCell>
                                                        <TableCell>{ltpc}</TableCell>
                                                        <TableCell>{c?.instructor?.name}</TableCell>
                                                        <TableCell align="center">{getStatusChip(reg.status)}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" onClick={() => handleViewPeers(c)}>
                                                                <GroupIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ))
                    )}
                </Stack>
            )}

            {/* Tab 1: Course Enrollment (Offered Courses) */}
            {activeTab === 1 && (
                <Stack spacing={3}>
                    {/* Filters Section */}
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <FilterListIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight="bold">Search Criteria</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button startIcon={<RestartAltIcon />} size="small" onClick={clearFilters}>Reset Filters</Button>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth size="small" label="Department" name="department" value={filters.department} onChange={handleFilterChange} placeholder="e.g. CSE" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth size="small" label="Course Code" name="code" value={filters.code} onChange={handleFilterChange} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth size="small" label="Title" name="title" value={filters.title} onChange={handleFilterChange} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField fullWidth size="small" label="Instructor" name="instructor" value={filters.instructor} onChange={handleFilterChange} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Session</InputLabel>
                                    <Select name="semester" value={filters.semester} label="Session" onChange={handleFilterChange}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="I">Semester I</MenuItem>
                                        <MenuItem value="II">Semester II</MenuItem>
                                        <MenuItem value="Summer">Summer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Results Table */}
                    <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }} elevation={1}>
                        <Box p={2} borderBottom="1px solid #eee">
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">Offered Courses</Typography>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell><strong>Offering Dept</strong></TableCell>
                                        <TableCell><strong>Code</strong></TableCell>
                                        <TableCell><strong>Title</strong></TableCell>
                                        <TableCell><strong>Acad Session</strong></TableCell>
                                        <TableCell><strong>L-T-P-C</strong></TableCell>
                                        <TableCell><strong>Instructor</strong></TableCell>
                                        <TableCell align="center"><strong>Status</strong></TableCell>
                                        <TableCell align="center"><strong>Peers</strong></TableCell>
                                        <TableCell align="center"><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCourses.map((course) => {
                                        const isEnrolled = myRegistrations.some(r => r.course._id === course._id);
                                        const ltpc = course.credits ? `${course.credits.lecture}-${course.credits.tutorial}-${course.credits.practical}-${course.credits.total}` : '3-0-0-3';

                                        return (
                                            <TableRow key={course._id} hover>
                                                <TableCell>{course.department}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{course.code}</TableCell>
                                                <TableCell>{course.title}</TableCell>
                                                <TableCell>{course.year}-{course.semester}</TableCell>
                                                <TableCell>{ltpc}</TableCell>
                                                <TableCell>{course.instructor?.name || 'TBA'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label="Running" color="success" size="small" variant="outlined" sx={{ height: 24 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" onClick={() => handleViewPeers(course)}>
                                                        <GroupIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {isEnrolled ? (
                                                        <Chip label="Applied" color="default" size="small" />
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="primary"
                                                            disableElevation
                                                            onClick={() => handleEnrollClick(course)}
                                                            sx={{ textTransform: 'none', py: 0.5 }}
                                                        >
                                                            Enroll
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredCourses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary">No courses found matching your criteria.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Stack>
            )}

            {/* Tab 2: Feedback */}
            {activeTab === 2 && (
                <Container maxWidth="md">
                    <Feedback registrations={myRegistrations} />
                </Container>
            )}

            {/* Tab 3: Help */}
            {activeTab === 3 && (
                <HelpTab />
            )}

            {/* Tab 4: Profile */}
            {activeTab === 4 && (
                <Container maxWidth="sm">
                    <Card>
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
                                {user.rollNumber && (
                                    <>
                                        <Typography sx={{ mt: 1 }}><strong>ENTRY NO:</strong> {user.rollNumber}</Typography>
                                        <Typography sx={{ mt: 1 }}><strong>YEAR:</strong> {user.rollNumber.substring(0, 4)}</Typography>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            )}

            {/* Enroll Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Enroll in {selectedCourse?.title}</DialogTitle>
                <DialogContent sx={{ minWidth: 300, mt: 1 }}>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Enrollment Type</InputLabel>
                        <Select
                            value={enrollType}
                            label="Enrollment Type"
                            onChange={(e) => setEnrollType(e.target.value)}
                        >
                            <MenuItem value="Credit">Credit</MenuItem>
                            <MenuItem value="Audit">Audit</MenuItem>
                            <MenuItem value="Minor">Minor</MenuItem>
                            <MenuItem value="Concentration">Concentration</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleEnrollSubmit} variant="contained" disabled={!!message.text && message.type === 'success'}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Peer View Dialog */}
            <Dialog open={openPeerDialog} onClose={() => setOpenPeerDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Students enrolled in {selectedCourse?.title}</DialogTitle>
                <DialogContent dividers>
                    {peerLoading ? (
                        <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                    ) : (
                        <List>
                            {peers.length === 0 ? (
                                <Typography align="center" color="textSecondary">No one else enrolled yet.</Typography>
                            ) : (
                                peers.map((p, index) => (
                                    <React.Fragment key={p._id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={p.student?.name}
                                                secondary={`${p.student?.department || ''} | ${p.student?.rollNumber || 'N/A'}`}
                                            />
                                            <Chip label={p.type} size="small" variant="outlined" />
                                        </ListItem>
                                        {index < peers.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPeerDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentDashboard;
