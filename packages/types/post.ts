export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  votes: number;
  createdAt: string;
  comments: Comment[];
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
};
