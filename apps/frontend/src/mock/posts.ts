export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  upvotes: number;
};

export const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Welcome to Operative Tortoise!',
    content: 'This is the very first post. Say hi to the community!',
    author: 'admin',
    createdAt: new Date().toISOString(),
    upvotes: 15,
  },
  {
    id: 2,
    title: 'What feature should we build next?',
    content: 'Drop your thoughts below ⬇️',
    author: 'johndoe',
    createdAt: new Date().toISOString(),
    upvotes: 8,
  },
];
