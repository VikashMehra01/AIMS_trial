import React, { useState } from 'react';
import InstructorPendingRequests from '../courses/InstructorPendingRequests';
import CourseFloatingForm from '../courses/CourseFloatingForm';

const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('float');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Instructor Dashboard</h2>

            <div className="flex border-b mb-4">
                <button
                    className={`p-3 ${activeTab === 'float' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('float')}>
                    Float Course
                </button>
                <button
                    className={`p-3 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('pending')}>
                    Pending Requests
                </button>
            </div>

            {activeTab === 'float' ? <CourseFloatingForm /> : <InstructorPendingRequests />}
        </div>
    );
};

export default InstructorDashboard;
