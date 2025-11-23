import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import { corsHeaders } from './utils/corsUtils';

const app = express();

app.use(express.json({ type: (req) => req.headers['content-type']?.includes('json') || false }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware - applies to ALL routes
app.use((req, res, next) => {
  // Apply all CORS headers from corsUtils
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.header(key, value);
  });

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
