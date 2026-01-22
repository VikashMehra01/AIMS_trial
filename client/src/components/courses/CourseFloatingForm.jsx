import React, { useState } from 'react';
import api from '../../utils/api';

const CourseFloatingForm = () => {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        department: '',
        lecture: 3,
        tutorial: 0,
        practical: 0,
        total: 3,
        semester: '',
        year: new Date().getFullYear().toString(),
        enrollmentDeadline: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { code, title, department, lecture, tutorial, practical, total, semester, year, enrollmentDeadline } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const courseData = {
                code,
                title,
                department,
                credits: { lecture, tutorial, practical, total },
                semester,
                year,
                enrollmentDeadline
            };

            const res = await api.post('/courses/float', courseData);
            setMessage(`Course ${res.data.code} floated successfully!`);
            // Reset form
            setFormData({ ...formData, code: '', title: '', enrollmentDeadline: '' });
        } catch (err) {
            setError(err.response?.data?.msg || 'Error floating course');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Float New Course</h3>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Course Code</label>
                        <input type="text" name="code" value={code} onChange={onChange} required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. CS101" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Course Title</label>
                        <input type="text" name="title" value={title} onChange={onChange} required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Introduction to CS" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Department</label>
                        <input type="text" name="department" value={department} onChange={onChange} required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Credits (L-T-P-Total)</label>
                        <div className="flex gap-2">
                            <input type="number" name="lecture" value={lecture} onChange={onChange} className="w-16 p-2 border rounded" placeholder="L" />
                            <input type="number" name="tutorial" value={tutorial} onChange={onChange} className="w-16 p-2 border rounded" placeholder="T" />
                            <input type="number" name="practical" value={practical} onChange={onChange} className="w-16 p-2 border rounded" placeholder="P" />
                            <input type="number" name="total" value={total} onChange={onChange} className="w-16 p-2 border rounded bg-gray-100" readOnly />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Semester</label>
                        <select name="semester" value={semester} onChange={onChange} required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Semester</option>
                            <option value="Monsoon">Monsoon</option>
                            <option value="Spring">Spring</option>
                            <option value="Summer">Summer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700">Year</label>
                        <input type="text" name="year" value={year} onChange={onChange} required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Enrollment Deadline</label>
                        <input type="date" name="enrollmentDeadline" value={enrollmentDeadline} onChange={onChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                    Float Course
                </button>
            </form>
        </div>
    );
};

export default CourseFloatingForm;
