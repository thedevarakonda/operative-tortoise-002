import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (_req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
