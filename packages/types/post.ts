export type Post = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  votes: number;
  createdAt: string;
  comments: Comment[];
};

export type Comment = {
  id: number;
  postId: number;
  authorId: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
};
