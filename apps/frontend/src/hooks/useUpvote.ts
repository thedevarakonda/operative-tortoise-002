// src/hooks/useUpvote.ts
import { useAuth } from '../context/AuthContext';
import { toaster } from '../components/ui/toaster';

export const useUpvote = () => {
  const { user } = useAuth(); // Get the logged-in user

  const hasUpvoted = (postId: number) => {
    return localStorage.getItem(`upvoted_${postId}`) === 'true';
  };

  const toggleUpvote = async (
    postId: number,
    currentUpvotes: number,
    setPostState: (upvotes: number) => void
  ) => {
    if (!user) {
      toaster.create({ title: 'You must be logged in to vote', type: 'error' });
      return;
    }

    const localKey = `upvoted_${postId}`;
    const hasVoted = hasUpvoted(postId);
    try {
      const res = await fetch(
        `http://localhost:3001/api/posts/${postId}/${hasVoted ? 'unvote' : 'upvote'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }), // ✨ Send the user's ID
        }
      );

      if (!res.ok) throw new Error();

      setPostState(currentUpvotes + (hasVoted ? -1 : 1));

      if (hasVoted) {
        localStorage.removeItem(localKey);
      } else {
        localStorage.setItem(localKey, 'true');
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  return { hasUpvoted, toggleUpvote };
};