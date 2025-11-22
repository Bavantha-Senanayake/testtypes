import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json({ type: (req) => req.headers['content-type']?.includes('json') || false }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/user', userRoutes);

export default app;
