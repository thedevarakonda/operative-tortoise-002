import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import commentsRoutes from './routes/comments';
import profileRoutes from './routes/profile';
import usersRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Serve static files from the 'uploads' directory
// This makes files in 'apps/backend/uploads' accessible via '/uploads' URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', authRoutes);
app.use('/api', postsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', profileRoutes);
app.use('/api', usersRoutes);
app.use('/api', notificationRoutes);

app.get('/', (_req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});