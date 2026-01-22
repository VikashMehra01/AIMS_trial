import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import AdvisorDashboard from './dashboards/AdvisorDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <div>Loading...</div>;
    }

    switch (user.role) {
        case 'student':
            return <StudentDashboard />;
        case 'instructor':
        case 'faculty': // Handle potential variations
            return <FacultyDashboard />;
        case 'faculty_advisor':
            return <AdvisorDashboard />;
        default:
            return <Navigate to="/login" />;
    }
};

export default Dashboard;
