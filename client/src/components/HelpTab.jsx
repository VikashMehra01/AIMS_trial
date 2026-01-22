import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const HelpTab = () => {
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({ type: 'Issue', description: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/help');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/help', formData);
            setRequests([res.data, ...requests]);
            setFormData({ type: 'Issue', description: '' });
            setMsg({ type: 'success', text: 'Request submitted successfully!' });
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to submit request.' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Closed': return 'success';
            case 'In Progress': return 'warning';
            default: return 'error'; // Open
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" align="center" gutterBottom sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
                Help & Support Center
            </Typography>

            <Grid container spacing={4}>
                {/* New Request Form */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary">New Request</Typography>
                        {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
                        <form onSubmit={handleSubmit}>
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Type"
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <MenuItem value="Issue">Technical Issue</MenuItem>
                                    <MenuItem value="Request">Administrative Request</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={4}
                                margin="normal"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth 
                                endIcon={<SendIcon />}
                                sx={{ mt: 2 }}
                            >
                                Submit
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* Past Requests List */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxHeight: 500, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom color="primary">My Requests</Typography>
                        {loading ? <Typography>Loading...</Typography> : (
                            <List>
                                {requests.length === 0 ? <Typography color="textSecondary">No requests yet.</Typography> : 
                                    requests.map((req, index) => (
                                        <React.Fragment key={req._id}>
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="subtitle2" fontWeight="bold">{req.type}</Typography>
                                                            <Chip label={req.status} size="small" color={getStatusColor(req.status)} variant="outlined" />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="textPrimary" display="block" sx={{ my: 0.5 }}>
                                                                {req.description}
                                                            </Typography>
                                                            {req.adminResponse && (
                                                                <Box 
                                                                    sx={{ 
                                                                        mt: 1, 
                                                                        p: 1.5, 
                                                                        bgcolor: 'rgba(99, 102, 241, 0.08)', 
                                                                        borderRadius: 2,
                                                                        borderLeft: '3px solid',
                                                                        borderColor: 'primary.main'
                                                                    }}
                                                                >
                                                                    <Typography variant="caption" color="primary.main" fontWeight="bold" display="block">
                                                                        Admin Response:
                                                                    </Typography>
                                                                    <Typography variant="body2" color="textPrimary" sx={{ mt: 0.5 }}>
                                                                        {req.adminResponse}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            <Typography variant="caption" color="textSecondary">
                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            {index < requests.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))
                                }
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default HelpTab;
