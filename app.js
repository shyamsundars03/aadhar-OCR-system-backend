import express from 'express';
import morgan from 'morgan';
import corsMiddleware from './src/config/cors.js';
import ocrRoutes from './src/routes/ocr.routes.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();

app.use(morgan('dev'));

app.use(corsMiddleware);
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aadhar OCR System Backend is running!',
    timestamp: new Date()
  });
});

app.use('/api/ocr', ocrRoutes);

app.use(errorHandler);

export default app;
