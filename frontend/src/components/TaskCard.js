import React from 'react';

function TaskCard({ task, onDelete }) {
    const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="task-card" role="listitem">
            <div className="task-checkbox" aria-hidden="true" />
            <div className="task-info">
                <div className="task-title" title={task.title}>{task.title}</div>
                <div className="task-meta">🕐 {formattedDate}</div>
            </div>
            <button
                className="btn-delete"
                onClick={() => onDelete(task._id)}
                aria-label={`Delete task: ${task.title}`}
                title="Delete task"
            >
                🗑️ Delete
            </button>
        </div>
    );
}

export default TaskCard;
