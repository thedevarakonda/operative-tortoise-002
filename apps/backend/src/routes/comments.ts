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


export default router;
