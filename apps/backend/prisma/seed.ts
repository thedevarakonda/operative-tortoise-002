import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find an existing user or create one
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
      },
    });
  }

  // Create dummy posts
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is the content of the first post.',
        upvotes: 10,
        authorId: user.id,
      },
      {
        title: 'Second Post',
        content: 'Another post with some interesting thoughts.',
        upvotes: 5,
        authorId: user.id,
      },
      {
      title: 'Why TypeScript is Awesome',
      content: 'Type safety and modern tooling make development smoother.',
      upvotes: 12,
      authorId: user.id,
    },
    {
      title: 'Learning Prisma',
      content: 'Prisma simplifies working with databases using a nice API.',
      upvotes: 8,
      authorId: user.id,
    },
    {
      title: 'Frontend vs Backend',
      content: 'Both are essential. But I love the joy of instant UI feedback.',
      upvotes: 15,
      authorId: user.id,
    },
    {
      title: 'How to Stay Productive',
      content: 'Break tasks into small chunks. Take breaks. Avoid distractions.',
      upvotes: 7,
      authorId: user.id,
    },
    {
      title: 'What I Learned This Week',
      content: 'Explored React hooks, Prisma relationships, and Chakra UI layouts.',
      upvotes: 4,
      authorId: user.id,
    },
    ],
  });

  console.log('🌱 Dummy data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
