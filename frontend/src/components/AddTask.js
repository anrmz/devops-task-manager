import React, { useState } from 'react';

function AddTask({ onAdd }) {
    const [title, setTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        setSubmitting(true);
        await onAdd(trimmed);
        setTitle('');
        setSubmitting(false);
    };

    return (
        <section className="add-task-section" aria-label="Add new task">
            <p className="section-title">➕ New Task</p>
            <form className="add-task-form" onSubmit={handleSubmit}>
                <input
                    className="task-input"
                    type="text"
                    placeholder="e.g. Configure Jenkins pipeline..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-label="Task title"
                    maxLength={200}
                    disabled={submitting}
                />
                <button
                    type="submit"
                    className="btn-add"
                    disabled={!title.trim() || submitting}
                    aria-label="Add task"
                >
                    {submitting ? '⏳ Adding...' : '+ Add Task'}
                </button>
            </form>
        </section>
    );
}

export default AddTask;
