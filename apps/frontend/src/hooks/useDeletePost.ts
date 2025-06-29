// src/hooks/useDeletePost.ts
import { toaster } from '../components/ui/toaster';

export const useDeletePost = () => {
  const deletePost = async (
    postId: number,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();

      toaster.create({ title: 'Post deleted successfully', type: 'success' });
      onSuccess?.();
    } catch (err) {
      toaster.create({ title: 'Failed to delete post', type: 'error' });
      onError?.();
    }
  };

  return { deletePost };
};
