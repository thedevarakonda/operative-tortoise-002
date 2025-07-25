// routes/comments.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Add a comment to a post (and create a notification)
router.post('/post/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  // Assuming 'senderId' is who made the comment.
  // In a real app, this should come from an authenticated session, e.g., req.user.id
  const { content, authorId: senderId } = req.body;

  if (!content || !senderId) {
    res.status(400).json({ error: 'Missing content or senderId' });
    return ;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { authorId: true }, // Only need the authorId
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return ;
    }

    // 1. Create the comment first
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: senderId,
      },
      include: { author: true },
    });

    // 2. Create a notification, but only if someone else commented on the post
    if (post.authorId !== senderId) {
      await prisma.notification.create({
        data: {
          postId: parseInt(postId),
          recipientId: post.authorId, // The author of the post
          senderId: senderId,          // The author of the comment
          type: 'NEW_COMMENT',
        },
      });
    }

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
