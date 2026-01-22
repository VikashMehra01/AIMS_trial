import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const FAPendingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/courses/fa/pending');
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.put(`/courses/fa/approve/${id}`, { action });
            // Refresh list
            setRequests(requests.filter(req => req._id !== id));
        } catch (err) {
            console.error(err);
            alert('Error processing request');
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pending FA Approvals</h3>
            {requests.length === 0 ? (
                <p className="text-gray-500">No requests pending for FA approval.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Student</th>
                                <th className="p-3">Roll No</th>
                                <th className="p-3">Course</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{req.student.name}</td>
                                    <td className="p-3">{req.student.rollNumber}</td>
                                    <td className="p-3">{req.course.code}</td>
                                    <td className="p-3">{req.type}</td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => handleAction(req._id, 'approve')}
                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(req._id, 'reject')}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FAPendingRequests;
