import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/posts/:id/upvote', async (req,res) => {
  const postId = req.params.id;
  console.log("In upvote handler Got id ",postId);
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

router.post('/posts/:id/unvote', async (req, res) => {
  const postId = req.params.id;
  try {
    await prisma.post.update({
      where: { id: Number(postId) },
      data: { upvotes: { decrement: 1 } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unvote post' });
  }
});



// Create a new post
router.post('/posts', async (req, res) => {
  const { title, content, authorId } = req.body;
  console.log("In / post")
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
router.get('/posts', async (_req, res) => {
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


router.get('/posts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const posts = await prisma.post.findMany({
      where: { id: Number(id) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
});

// Update an existing post
router.put('/posts/:id', async (req, res) => {
  const postId = Number(req.params.id);
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        updatedAt: new Date(),
      },
    });
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/posts/:id', async (req, res) => {
  const postId = Number(req.params.id);
  console.log("in delete req handler")
  try {
    await prisma.post.delete({
      where: { id: postId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;