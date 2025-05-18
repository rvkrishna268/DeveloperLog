// src/components/DeveloperDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
// import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import Navbar from "./Navbar";
import Heatmap from "./Heatmap";

const DeveloperDashboard = () => {
  // const { user } = useAuth();
  const [tasks, setTasks] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [mood, setMood] = useState("😊");
  const [blockers, setBlockers] = useState("");
  const [logs, setLogs] = useState([]);
  const [tags, setTags] = useState("");
  const [editLog, setEditLog] = useState(null);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLogs = async () => {
    const res = await axios.get("http://localhost:5000/api/logs/me");
    setLogs(res.data);
  };

  useEffect(() => {
    fetchLogs();
    setTags("");
    setEditLog(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/logs", {
        tags: tags.split(",").map((t) => t.trim()),
        tasks,
        timeSpent: Number(timeSpent),
        mood,
        blockers,
      });

      setTasks("");
      setTimeSpent(0);
      setMood("😊");
      setBlockers("");
      setTags("");
      setShowAddModal(false);
      fetchLogs();
    } catch (err) {
      alert("Error submitting log");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:5000/api/logs/${editLog._id}`, {
        tags: editLog.tags,
        tasks: editLog.tasks,
        timeSpent: editLog.timeSpent,
        mood: editLog.mood,
        blockers: editLog.blockers,
      });
      setEditLog(null);
      fetchLogs();
    } catch (err) {
      alert("Error updating log");
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/logs/${logId}`);
      fetchLogs(); // Refresh logs after delete
    } catch (err) {
      alert("Error deleting log");
    }
  };

  const exportToCSV = (logs) => {
    const headers = ["Date", "Mood", "Time Spent", "Blockers", "Tags", "Tasks"];
    const rows = logs.map((log) => [
      new Date(log.date).toLocaleDateString(),
      log.mood,
      log.timeSpent,
      log.blockers || "",
      (log.tags || []).join(", "),
      '"' + log.tasks.replace(/"/g, '""') + '"',
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "devlog_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyDateFilter = () => {
    if (!filters.startDate || !filters.endDate) return;
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    setLogs((prev) =>
      prev.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= start && logDate <= end;
      })
    );
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Developer Dashboard</h2>

        <button
          className="bg-purple-600 text-white px-4 py-2 mb-6 rounded"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Log
        </button>

        <h3 className="text-xl font-semibold mb-2">Your Previous Logs</h3>
        <div className="mb-6">
          <label className="block text-sm mb-1">Filter by Date Range:</label>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              className="p-2 border"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
            <span className="text-sm">to</span>
            <input
              type="date"
              className="p-2 border"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 text-sm"
              onClick={applyDateFilter}
            >
              Apply
            </button>
          </div>
        </div>
        <table className="w-full text-sm border mb-6">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Tags</th>
              <th className="p-2 text-left">Tasks Completed</th>
              <th className="p-2 text-left">Time Spent</th>
              <th className="p-2 text-left">Mood</th>
              <th className="p-2 text-left">Blockers</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs
              .filter((log) => {
                if (!filters.startDate || !filters.endDate) return true;
                const d = new Date(log.date);
                return (
                  d >= new Date(filters.startDate) &&
                  d <= new Date(filters.endDate)
                );
              })
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((log) => (
                <tr key={log._id} className="border-b">
                  <td className="p-2">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">{(log.tags || []).join(", ")}</td>
                  <td className="p-2">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-xs">{children}</p>
                        ),
                      }}
                    >
                      {log.tasks}
                    </ReactMarkdown>
                  </td>
                  <td className="p-2">{log.timeSpent}h</td>
                  <td className="p-2">{log.mood}</td>
                  <td className="p-2">{log.blockers || "-"}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => setEditLog(log)}
                      disabled={log.reviewed}
                      className="text-blue-600 underline text-xs"
                      style={{
                        opacity: log.reviewed ? 0.5 : 1,
                        pointerEvents: log.reviewed ? "none" : "auto",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="text-red-600 underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-6"
          onClick={() => exportToCSV(logs)}
        >
          📤 Export Logs as CSV
        </button>

        <Heatmap logs={logs} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Add New Log</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task Tags (e.g.Frontend, Api, Fix)"
                className="w-full p-2 border"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                required
              />

              <textarea
                rows="4"
                placeholder="Tasks completed"
                className="w-full p-2 border"
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                required
              ></textarea>

              <input
                type="number"
                placeholder="Time spent (hours)"
                className="w-full p-2 border"
                value={timeSpent === "" ? "" : Number(timeSpent)}
                onChange={(e) => setTimeSpent(e.target.value)}
                required
              />

              <select
                className="w-full p-2 border"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                required
              >
                <option value="😊">😊 Happy</option>
                <option value="😐">😐 Neutral</option>
                <option value="😞">😞 Sad</option>
              </select>

              <input
                type="text"
                placeholder="Any blockers?"
                className="w-full p-2 border"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editLog && !editLog.reviewed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Log</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <textarea
                rows="4"
                className="w-full p-2 border"
                value={editLog.tasks}
                onChange={(e) =>
                  setEditLog({ ...editLog, tasks: e.target.value })
                }
              ></textarea>
              <input
                type="number"
                className="w-full p-2 border"
                value={editLog.timeSpent}
                onChange={(e) =>
                  setEditLog({ ...editLog, timeSpent: Number(e.target.value) })
                }
              />
              <select
                className="w-full p-2 border"
                value={editLog.mood}
                onChange={(e) =>
                  setEditLog({ ...editLog, mood: e.target.value })
                }
              >
                <option value="😊">😊 Happy</option>
                <option value="😐">😐 Neutral</option>
                <option value="😞">😞 Sad</option>
              </select>
              <input
                type="text"
                className="w-full p-2 border"
                value={editLog.blockers}
                onChange={(e) =>
                  setEditLog({ ...editLog, blockers: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full p-2 border"
                value={editLog.tags?.join(", ") || ""}
                onChange={(e) =>
                  setEditLog({
                    ...editLog,
                    tags: e.target.value.split(",").map((t) => t.trim()),
                  })
                }
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditLog(null)}
                  type="button"
                  className="px-4 py-2 border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DeveloperDashboard;
