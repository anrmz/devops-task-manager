require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskmanager';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Task Manager API' });
});

// Routes
app.use('/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Prevent port collision in Jest tests by conditionally listening
        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;
