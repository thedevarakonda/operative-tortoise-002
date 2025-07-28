// apps/backend/src/routes/notifications.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  // ✨ Get 'limit' from query params, default to 15 if not provided
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 15;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
        isCleared: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit, // ✨ Use the limit from the query parameter
      include: {
        sender: {
          select: {
            username: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.setHeader('Cache-Control', 'no-store');
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/notifications/:userId/unread-count', async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
        isCleared: false,
      },
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notifications as read
router.post('/notifications/mark-as-read', async (req, res) => {
  const { userId } = req.body; 

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Handle "clear all" request from the frontend
router.post('/notifications/clear-all', async (req, res) => {
  const { userId } = req.body;

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
      },
      data: {
        isCleared: true, // Set the cleared flag to true
      },
    });
    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error)    {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

export default router;