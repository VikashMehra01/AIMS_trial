import React, { useState, useEffect } from 'react';
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
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import HelpTab from '../../components/HelpTab';
import api from '../../utils/api';

const AdvisorDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Profile View State
    const [viewProfileOpen, setViewProfileOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/courses/fa/pending');
            setPendingRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/courses/fa/approve/${id}`, { action });
            setMessage({ type: 'success', text: `Request ${action}ed successfully` });
            fetchData();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleViewProfile = (student) => {
        setSelectedStudent(student);
        setViewProfileOpen(true);
    };

    // Helper to parse Entry No
    const parseEntryNumber = (entryNo) => {
        if (!entryNo || entryNo.length < 7) return { year: 'N/A', branch: 'N/A' };
        // Example: 2023CSB1143
        const year = entryNo.substring(0, 4);
        const branch = entryNo.substring(4, 7);
        return { year, branch };
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Faculty Advisor Dashboard
            </Typography>

            {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            <Paper square sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                    <Tab icon={<AssignmentIcon />} label="Pending Requests" />
                    <Tab icon={<HelpIcon />} label="Help & Support" />
                </Tabs>
            </Paper>

            {/* Tab 0: Pending Requests */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Enrollments Pending Final Approval
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Student</strong></TableCell>
                                            <TableCell><strong>Course</strong></TableCell>
                                            <TableCell><strong>Entry No.</strong></TableCell>
                                            <TableCell><strong>Type</strong></TableCell>
                                            <TableCell align="center"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingRequests.map((req) => (
                                            <TableRow key={req._id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {req.student?.name}
                                                        <IconButton 
                                                            size="small" 
                                                            color="info" 
                                                            onClick={() => handleViewProfile(req.student)}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <InfoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{req.course?.code}: {req.course?.title}</TableCell>
                                                <TableCell>{req.student?.rollNumber}</TableCell>
                                                <TableCell>{req.type}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                        onClick={() => handleAction(req._id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleAction(req._id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {pendingRequests.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <Typography variant="body1" sx={{ py: 2 }}>
                                                        No pending approvals requiring your attention.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Tab 1: Help */}
            {activeTab === 1 && (
                <HelpTab />
            )}

            {/* Student Profile Dialog */}
            <Dialog open={viewProfileOpen} onClose={() => setViewProfileOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Student Profile</DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box textAlign="center" py={2}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>{selectedStudent.name}</Typography>
                            <Typography color="textSecondary" gutterBottom>{selectedStudent.email}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2} textAlign="left">
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                                    <Typography variant="body1" fontWeight="medium">{selectedStudent.department || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Entry Number</Typography>
                                    <Typography variant="body1" fontWeight="medium">{selectedStudent.rollNumber || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Year of Entry</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {parseEntryNumber(selectedStudent.rollNumber).year}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Branch</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {parseEntryNumber(selectedStudent.rollNumber).branch}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewProfileOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdvisorDashboard;
