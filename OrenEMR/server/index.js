import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import reportsRoutes from './routes/reports.js';
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI);


import express from 'express';
import mongoose from 'mongoose';
import visitRoutes from './routes/visits.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from './middleware/authMiddleware.js';

// Import routes
import authRoutes from './routes/auth.js';
import authUpdateRoutes from './routes/auth-update.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import billingRoutes from './routes/billing.js';
import aiRoutes from './routes/aiRoutes.js';
import notesRoutes from './routes/notes.js';
import googleCalendarRoutes from './routes/googleCalendar.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5001; // Changed port to 5001 to avoid conflict

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authUpdateRoutes);
app.use('/api/patients', patientRoutes); // Removed authenticateToken for testing
app.use('/api/appointments', appointmentRoutes); // Removed authenticateToken for testing
app.use('/api/billing', billingRoutes); // Removed authenticateToken for testing
app.use('/api', aiRoutes);
app.use('/api/notes', notesRoutes); // Removed authenticateToken for testing
app.use('/api/google-calendar', googleCalendarRoutes); // Removed authenticateToken for testing
app.use('/api/tasks', taskRoutes); // Removed authenticateToken for testing
app.use('/api/notifications', notificationRoutes); // Removed authenticateToken for testing

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.use('/api/reports', reportsRoutes); // Already updated above
app.use('/api/visits', visitRoutes); // Removed authenticateToken for testing
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
