

// src/components/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const ManagerDashboard = () => {
  // const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ date: '', devName: '', blockers: '', tags: '' });

  const fetchLogs = async () => {
    const query = [];
    if (filters.date) query.push(`date=${filters.date}`);
    if (filters.blockers) query.push(`blockers=${filters.blockers}`);
    if (filters.devName) query.push(`devName=${filters.devName}`);
    if (filters.tags) query.push(`tags=${filters.tags}`);
    const res = await axios.get(`http://localhost:5000/api/logs?${query.join('&')}`);
    setLogs(res.data);
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFeedback = async (id) => {
    const feedback = prompt('Enter feedback');
    if (!feedback) return;
    await axios.patch(`http://localhost:5000/api/logs/${id}/review`, { feedback });
    fetchLogs();
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Manager Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="date"
            className="p-2 border"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filter by developer name (not used)"
            className="p-2 border"
            value={filters.devName}
            onChange={(e) => setFilters({ ...filters, devName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filter by blockers"
            className="p-2 border"
            value={filters.blockers}
            onChange={(e) => setFilters({ ...filters, blockers: e.target.value })}
          />
        </div>
        <input
          type="text"
          placeholder="Filter by task tags (comma-separated)"
          className="p-2 border"
          value={filters.tags}
          onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {logs.map((log) => (
            <div key={log._id} className="border border-black p-4 rounded shadow bg-white">
              <div className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</div>
              <div className="font-semibold text-sm">{log.user?.name || 'Unknown Dev'}</div>
              <div className="text-xs">Mood: {log.mood} | Time: {log.timeSpent}h</div>
              <div className="text-xs text-gray-700">Blockers: {log.blockers || 'None'}</div>
              <div className="text-xs text-gray-500">Tags: {(log.tags || []).join(', ')}</div>
              <ReactMarkdown
                components={{ p: ({ children }) => <p className="mt-2 text-sm">{children}</p> }}
              >
                {log.tasks}
              </ReactMarkdown>
              <div className="mt-2">
                {log.reviewed ? (
                  <span className="text-green-600 text-xs">Reviewed: {log.feedback}</span>
                ) : (
                  <button onClick={() => handleFeedback(log._id)} className="bg-blue-600 text-white px-2 py-1 text-xs">
                    Mark as Reviewed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;