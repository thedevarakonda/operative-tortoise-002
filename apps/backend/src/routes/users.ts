import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/user/:username', async (req, res) => {
  console.log("GET request for user profile")
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return ;
    }

    res.json({ id: user.id });
  } catch (err) {
    console.error("Failed to check username:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
