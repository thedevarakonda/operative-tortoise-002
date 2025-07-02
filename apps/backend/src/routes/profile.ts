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
      bio: true
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
    createdAt: user.createdAt,
    bio : user.bio
  });
});


//Get all posts of a particular User
router.get('/profile/:id/posts', async (req, res) => {
  const id = req.params.id;

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: id },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        upvotes: true,
        author:true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

router.put('/profile/:id/password', async (req, res) => {
  const userId = (req.params.id);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current and new passwords are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    } 

    if (user.password !== currentPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    res.json({ success: true, message: 'Password updated successfully' });
    return 

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
    return ;
  }
});

router.get('/profile/username-to-id/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;