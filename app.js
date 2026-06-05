import express from 'express';
import morgan from 'morgan';
import corsMiddleware from './src/config/cors.js';
import ocrRoutes from './src/routes/ocr.routes.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();

// Request logging middleware
app.use(morgan('dev'));

// CORS and JSON middlewares
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aadhar OCR System Backend is running!',
    timestamp: new Date()
  });
});

app.use('/api/ocr', ocrRoutes);

// Global Error Handling Middleware (must be at the end)
app.use(errorHandler);

export default app;
