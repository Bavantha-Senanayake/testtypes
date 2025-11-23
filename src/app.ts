import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json({ type: (req) => req.headers['content-type']?.includes('json') || false }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/user', userRoutes);

export default app;
