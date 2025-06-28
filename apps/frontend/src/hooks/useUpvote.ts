// src/hooks/useUpvote.ts
export const useUpvote = () => {
  const hasUpvoted = (postId: number) => {
    return localStorage.getItem(`upvoted_${postId}`) === 'true';
  };

  const toggleUpvote = async (
    postId: number,
    currentUpvotes: number,
    setPostState: (upvotes: number) => void
  ) => {
    const localKey = `upvoted_${postId}`;
    const hasVoted = hasUpvoted(postId);
    try {
      const res = await fetch(
        `http://localhost:3001/api/posts/${postId}/${hasVoted ? 'unvote' : 'upvote'}`,
        { method: 'POST' }
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
