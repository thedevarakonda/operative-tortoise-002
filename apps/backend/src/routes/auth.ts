import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username) {
   res.status(400).json({ error: 'Username is required' });
   return;
  }

  // Mock user object
  const user = {
    id: Date.now(),
    username,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
  };

  // Respond with the mock user
  res.json({ user });
});

export default router;
