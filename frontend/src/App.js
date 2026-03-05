import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './App.css';
import TaskCard from './components/TaskCard';
import AddTask from './components/AddTask';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setError(null);
            const { data } = await axios.get(`${API_URL}/tasks`);
            setTasks(data.data);
        } catch (err) {
            setError('Failed to connect to the API. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTask = async (title) => {
        try {
            const { data } = await axios.post(`${API_URL}/tasks`, { title });
            setTasks((prev) => [data.data, ...prev]);
            toast.success('✅ Task added successfully!');
        } catch (err) {
            toast.error('❌ Failed to add task.');
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            toast.info('🗑️ Task deleted.');
        } catch (err) {
            toast.error('❌ Failed to delete task.');
        }
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <div className="logo-icon">✅</div>
                        <h1>Task Manager</h1>
                    </div>
                    <span className="header-badge">DevOps Project</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                {/* Stats */}
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-number">{loading ? '—' : tasks.length}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number" style={{ color: '#22c55e' }}>
                            {loading ? '—' : tasks.length}
                        </div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number" style={{ color: '#f59e0b' }}>
                            v1.0
                        </div>
                        <div className="stat-label">Version</div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="error-banner" role="alert">
                        ⚠️ {error}
                    </div>
                )}

                {/* Add Task */}
                <AddTask onAdd={handleAddTask} />

                {/* Task List */}
                <div className="tasks-section">
                    <div className="tasks-header">
                        <p className="section-title">Your Tasks</p>
                        {!loading && (
                            <span className="task-count-badge">{tasks.length} items</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner" />
                            <span>Loading tasks...</span>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <h3>No tasks yet</h3>
                            <p>Add your first task above to get started.</p>
                        </div>
                    ) : (
                        <div className="tasks-list">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>
                    Built by <span>Anouar Mezgualli</span> · ENSI Tanger ·{' '}
                    Prof. Pr. KOUISSI Mohamed · DevOps Mini Project
                </p>
            </footer>
        </div>
    );
}

export default App;
