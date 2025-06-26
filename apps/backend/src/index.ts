import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import profileRoutes from './routes/profile';
import userRoutes from './routes/users'


const app = express();
const PORT = 3001;

app.use(express.json()); // Middleware to parse JSON
app.use(cors());

app.use('/api', authRoutes); // Mount auth routes
app.use('/api', postRoutes);
app.use('/api',profileRoutes);
app.use('/api',userRoutes);

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
