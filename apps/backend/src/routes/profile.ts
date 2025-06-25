import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();


router.get('/profile/:id', async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
    }
  });
  if (!user){
   res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    name: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt
  });
});

export default router;