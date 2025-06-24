import express, { NextFunction, Request, Response } from "express";
import apiRouter from "./routers";
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    // database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to Express problems Backend API',
    version: '1.0.0',
    database: 'MySQL',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      contest: '/api/contest',
      problem: '/api/problem',
      discuss: '/api/discuss',
    }
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app;