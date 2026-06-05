import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aadhar OCR System Backend is running!',
    timestamp: new Date()
  });
});

export default app;
