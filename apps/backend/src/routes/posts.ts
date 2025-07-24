import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer'; 
import path from 'path';    

const prisma = new PrismaClient();
const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists relative to the backend root
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create a unique filename by appending timestamp and original extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit 
  fileFilter: (req, file, cb) => {
    // Allow only images and videos (you can extend this list)
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});


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

// Create a new post with optional media upload
router.post('/posts', upload.single('media'), async (req, res) => { 
  const { title, content, authorId } = req.body;
  const mediaFile = req.file; 

  console.log("In / post")
  if (!title || !content || !authorId) {
    // If there's a file, but other fields are missing, clean up the file
    if (mediaFile) {
        // You might want to delete the uploaded file here if the post creation fails
        // Example: fs.unlinkSync(mediaFile.path); (requires 'fs' import)
    }
    res.status(400).json({ error: 'Title, content, and authorId are required' });
    return;
  }

  let mediaUrl: string | undefined;
  if (mediaFile) {
    // Construct the URL to access the uploaded media
    mediaUrl = `/uploads/${mediaFile.filename}`; // This matches the static route in index.ts
  }
  const defaultUpvotes = 0;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        upvotes: defaultUpvotes,
        authorId,
        mediaUrl, 
      },
    });
    res.json(post);
  } catch (err: any) { // Add ': any' to err for type safety if you're not narrowing it further
    console.error(err);
    // If Prisma creation fails, you might want to delete the uploaded file
    if (mediaFile) {
        // You would need to import 'fs' for this: import fs from 'fs';
        // fs.unlinkSync(mediaFile.path);
    }
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
});

// Get all posts
router.get('/posts', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
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

// Get paginated posts except those of the logged-in user
router.get('/other-posts/:userId', async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = (page - 1) * limit;

  try {
    // Get total count first
    const total = await prisma.post.count({
      where: {
        authorId: {
          not: userId,
        },
      },
    });

    // Fetch paginated posts
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          not: userId,
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.json({ posts, total });
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
        createdAt: true,
        mediaUrl: true,
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
  const { title, content } = req.body; // Note: For updating media, you'd need another upload handler

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
    // Optional: Fetch the post first to get mediaUrl and delete the file from disk
    const postToDelete = await prisma.post.findUnique({
      where: { id: postId },
      select: { mediaUrl: true }
    });

    await prisma.post.delete({
      where: { id: postId },
    });

    // If a media file exists, delete it from the server
    if (postToDelete?.mediaUrl) {
      const filePath = path.join(__dirname, '../../', postToDelete.mediaUrl);
      // You would need to import 'fs' for this: import fs from 'fs';
      // fs.unlink(filePath, (err) => {
      //   if (err) console.error('Failed to delete media file:', err);
      // });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get detailed info for a single post (without comments)
router.get('/posts/:id/detail', async (req, res) => {
  console.log("Got request")
  const postId = Number(req.params.id);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      // REMOVED 'include' block
      select: { // Combined all desired fields and relations here
        id: true,
        title: true,
        content: true,
        mediaUrl: true,
        createdAt: true,
        updatedAt: true,
        upvotes: true,
        author: { // Select specific fields from the author relation
          select: { username: true, avatar: true }
        },
        // If you wanted to include comments here, you would add:
        // comments: {
        //   select: {
        //     id: true,
        //     content: true,
        //     createdAt: true,
        //     author: {
        //       select: { username: true, avatar: true }
        //     }
        //   }
        // }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post detail' });
  }
});


export default router;