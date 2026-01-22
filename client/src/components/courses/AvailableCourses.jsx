import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AvailableCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleRegister = async (courseId, type) => {
        try {
            await api.post('/courses/register', { courseId, type });
            setMessage('Registration requested successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error working request');
        }
    };

    if (loading) return <div>Loading courses...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Available Courses</h3>
            {message && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{message}</div>}

            <div className="grid grid-cols-1 gap-4">
                {courses.map(course => (
                    <div key={course._id} className="border p-4 rounded shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">{course.code}: {course.title}</h4>
                                <p className="text-gray-600 text-sm">{course.department} | {course.semester} {course.year}</p>
                                <p className="text-gray-500 text-xs mt-1">Instructor: {course.instructor?.name}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Credits: {course.credits.lecture}-{course.credits.tutorial}-{course.credits.practical}-{course.credits.total}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleRegister(course._id, 'Credit')}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                    Credit
                                </button>
                                <button onClick={() => handleRegister(course._id, 'Audit')}
                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                                    Audit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailableCourses;
