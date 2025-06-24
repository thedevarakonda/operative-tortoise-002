import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

//upvotes for a post

router.post('/:id/upvote', async (req,res) => {
  const postId = req.params.id;
  console.log("Got id ",postId);
  try {
    await prisma.post.update({
      where: { id: Number(postId) },
      data: { upvotes: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote post' });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  const { title, content, authorId } = req.body;

  if (!title || !content || !authorId) {
    res.status(400).json({ error: 'Title, content, and authorId are required' });
    return;
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;
