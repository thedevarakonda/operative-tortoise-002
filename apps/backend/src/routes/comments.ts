// routes/comments.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Add a comment to a post
router.post('/post/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { content, authorId } = req.body;

  if (!content || !authorId) {
    res.status(400).json({ error: 'Missing content or authorId' });
    return;
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId,
      },
      include: { author: true },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ✅ Get all comments for a post
router.get('/post/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ✅ Get comment count for a post
router.get('/post/:postId/comments/count', async (req, res) => {
  const { postId } = req.params;

  try {
    const count = await prisma.comment.count({
      where: { postId: parseInt(postId) },
    });
    console.log(`PostId: ${postId}, Count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching comment count:', error);
    res.status(500).json({ error: 'Failed to fetch comment count' });
  }
});

// ✅ Delete a comment
router.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
