// apps/backend/src/routes/notifications.ts
import express from 'express';
import { Prisma,PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // --- Query Parameters ---
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const cleared = req.query.cleared; // Can be 'true', 'false', or undefined

  try {
    // --- Dynamic Where Clause ---
    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
    };

    // Only add the 'isCleared' filter if the client provides the 'cleared' query param
    if (cleared === 'true') {
      where.isCleared = true;
    } else if (cleared === 'false') {
      where.isCleared = false;
    }
    // If 'cleared' is not provided, the filter is omitted, and ALL notifications are fetched.

    const notifications = await prisma.notification.findMany({
      where, // Use the dynamically built where clause
      orderBy: { createdAt: 'desc' },
      take: limit, // If 'limit' is undefined, Prisma fetches all records
      include: {
        sender: {
          select: { username: true, avatar: true },
        },
        post: {
          select: { id: true, title: true },
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