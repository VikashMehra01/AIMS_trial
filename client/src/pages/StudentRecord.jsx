import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentRecord = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/student-record', {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="page-title">Academic Record</h1>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <div style={{ color: 'var(--text-secondary)' }}>Name</div>
                        <div style={{ fontWeight: 600 }}>{data?.student?.name}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)' }}>Roll No</div>
                        <div style={{ fontWeight: 600 }}>{data?.student?.rollNumber}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)' }}>Program</div>
                        <div style={{ fontWeight: 600 }}>{data?.student?.degree} in {data?.student?.department}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '16px' }}>S.No</th>
                            <th style={{ padding: '16px' }}>Course</th>
                            <th style={{ padding: '16px' }}>Category</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Grade</th>
                            <th style={{ padding: '16px' }}>Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.history?.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.sNo}</td>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{item.course}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                                        {item.category}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{item.status}</td>
                                <td style={{ padding: '16px', fontWeight: 700, color: item.grade === 'Pending' ? 'orange' : 'white' }}>{item.grade}</td>
                                <td style={{ padding: '16px' }}>{item.attendance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                * Disclaimer: Some grades may be pending approval from the Senate. Please verify with the academic office if discrepancies exist.
            </p>
        </div>
    );
};

export default StudentRecord;
