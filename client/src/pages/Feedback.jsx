import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Box,
    Rating,
    Slider,
    Grid,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Feedback = ({ registrations = [] }) => {
    const [active, setActive] = useState(false);
    const [feedbackInfo, setFeedbackInfo] = useState({});
    const [selectedCourseId, setSelectedCourseId] = useState('');
    
    // Questions State with full question text
    const [responses, setResponses] = useState({
        'Instructor informed the evaluation criteria at the beginning of the course': '',
        'Number of Lectures taken by course instructor were adequate': '',
        'The instructor adapted professional ethics': '',
        'The instructor was sincere (timely release of grades, etc.)': '',
        'The instructor had command over the subject': '',
    });

    const [additionalComments, setAdditionalComments] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkActive = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/feedback/active', {
                     headers: { 'x-auth-token': token }
                });
                setActive(res.data.active);
                setFeedbackInfo(res.data);
            } catch (err) {
                console.error(err);
                 setFeedbackInfo({ type: 'Mid-Semester', semester: 'Sem-I, 2026-27' });
                 setActive(true);
            }
        };
        checkActive();
    }, []);

    const handleChange = (question, value) => {
        setResponses(prev => ({ ...prev, [question]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/feedback', {
                courseId: selectedCourseId,
                ratings: responses,
                content: additionalComments,
                feedbackType: feedbackInfo.type
            }, {
                headers: { 'x-auth-token': token }
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setSubmitted(true);
        }
    };

    // Filter eligible courses
    const eligibleCourses = registrations.filter(r => 
        r.status === 'Approved' || r.status === 'Pending_Instructor' || r.status === 'Pending_FA'
    );

    if (!active) {
        return (
             <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                <Typography color="textSecondary">No active feedback session.</Typography>
            </Paper>
        );
    }

    if (submitted) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" color="success.main" gutterBottom>Feedback Submitted Successfully</Typography>
                <Button sx={{ mt: 2 }} onClick={() => {
                    setSubmitted(false); 
                    setResponses({
                        'Instructor informed the evaluation criteria at the beginning of the course': '',
                        'Number of Lectures taken by course instructor were adequate': '',
                        'The instructor adapted professional ethics': '',
                        'The instructor was sincere (timely release of grades, etc.)': '',
                        'The instructor had command over the subject': '',
                    });
                    setAdditionalComments('');
                    setSelectedCourseId('');
                }}>Submit Another</Button>
            </Paper>
        );
    }

    const yesNoQuestions = [
        'Instructor informed the evaluation criteria at the beginning of the course',
        'Number of Lectures taken by course instructor were adequate'
    ];

    const agreementQuestions = [
        'The instructor adapted professional ethics',
        'The instructor was sincere (timely release of grades, etc.)',
        'The instructor had command over the subject'
    ];

    return (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            {/* Header / Instructions */}
            <Box mb={3} borderBottom="1px solid #eee" pb={2}>
                 <Typography variant="h6" gutterBottom fontWeight="bold">Course Feedback Form</Typography>
                 <Box bgcolor="#fff3e0" p={2} borderRadius={1} fontSize="0.9rem">
                    <strong>Please note the following before submitting:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                        <li>All fields marked with a '*' are mandatory.</li>
                        <li>Feedback for one course instructor can be submitted only once.</li>
                        <li>Feedback is anonymous.</li>
                    </ul>
                 </Box>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Top Row: Type & Course Selector */}
                    <Grid item xs={12} md={4}>
                         <FormControl fullWidth size="small">
                            <Typography variant="caption" fontWeight="bold" gutterBottom>* Feedback type</Typography>
                            <TextField 
                                size="small" 
                                value={feedbackInfo.type || 'Mid-Sem'} 
                                InputProps={{ readOnly: true }} 
                                variant="outlined" 
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl fullWidth size="small" required>
                            <Typography variant="caption" fontWeight="bold" gutterBottom>* Select the course instructor</Typography>
                            <Select
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                                displayEmpty
                                variant="outlined"
                            >
                                <MenuItem value="" disabled>-- Select Course --</MenuItem>
                                {eligibleCourses.map(reg => (
                                    <MenuItem key={reg._id} value={reg.course?._id}>
                                        {reg.course?.title} ({reg.course?.code}) -- {reg.course?.instructor?.name || 'TBA'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Yes/No Questions */}
                    {yesNoQuestions.map((question, idx) => (
                        <Grid item xs={12} key={idx}>
                            <FormControl fullWidth required>
                                <Typography variant="body2" gutterBottom fontWeight="medium">
                                    *{idx + 1}: {question}
                                </Typography>
                                <Select
                                    value={responses[question]}
                                    onChange={(e) => handleChange(question, e.target.value)}
                                    displayEmpty
                                    size="small"
                                >
                                    <MenuItem value="" disabled>-- Select Response --</MenuItem>
                                    <MenuItem value="Yes">Yes</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}

                    {/* Agreement Scale Questions */}
                    {agreementQuestions.map((question, idx) => (
                        <Grid item xs={12} key={idx}>
                            <FormControl fullWidth required>
                                <Typography variant="body2" gutterBottom fontWeight="medium">
                                    *{idx + 3}: {question}
                                </Typography>
                                <Select
                                    value={responses[question]}
                                    onChange={(e) => handleChange(question, e.target.value)}
                                    displayEmpty
                                    size="small"
                                >
                                    <MenuItem value="" disabled>-- Select Response --</MenuItem>
                                    <MenuItem value="Strongly agree">Strongly agree</MenuItem>
                                    <MenuItem value="Agree">Agree</MenuItem>
                                    <MenuItem value="Neither agree nor disagree">Neither agree nor disagree</MenuItem>
                                    <MenuItem value="Disagree">Disagree</MenuItem>
                                    <MenuItem value="Strongly disagree">Strongly disagree</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}

                    {/* Optional Additional Comments */}
                    <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom fontWeight="medium">
                            Additional Comments (Optional)
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={additionalComments}
                            onChange={(e) => setAdditionalComments(e.target.value)}
                            placeholder="Share any additional feedback, suggestions, or comments..."
                            helperText="This field is optional but your input is valuable"
                        />
                    </Grid>

                    <Grid item xs={12}>
                         <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={!selectedCourseId || Object.values(responses).some(v => !v)}
                            sx={{ mt: 2 }}
                         >
                            Submit Feedback
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default Feedback;
