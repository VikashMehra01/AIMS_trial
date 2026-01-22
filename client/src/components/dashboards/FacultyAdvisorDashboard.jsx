import React from 'react';
import FAPendingRequests from '../courses/FAPendingRequests';

const FacultyAdvisorDashboard = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Faculty Advisor Dashboard</h2>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-orange-50 p-4 rounded border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-700 mb-2">My Advisees</h3>
                    <p className="text-gray-600">View and manage assigned students.</p>
                </div>
            </div>

            <FAPendingRequests />
        </div>
    );
};

export default FacultyAdvisorDashboard;
