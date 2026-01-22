import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MyRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await api.get('/courses/my-registrations');
                setRegistrations(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    if (loading) return <div>Loading registrations...</div>;

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'bg-green-100 text-green-800';
        if (status === 'Rejected') return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">My Registrations</h3>
            {registrations.length === 0 ? (
                <p className="text-gray-500">You have not registered for any courses yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Course Code</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map(reg => (
                                <tr key={reg._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{reg.course.code}</td>
                                    <td className="p-3">{reg.course.title}</td>
                                    <td className="p-3">{reg.type}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(reg.status)}`}>
                                            {reg.status}
                                        </span>
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

export default MyRegistrations;
