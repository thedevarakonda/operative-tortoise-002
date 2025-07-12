import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  IconButton,
  Spinner,
  Flex,
  Button,
  Textarea
} from "@chakra-ui/react";
import { BiArrowBack, BiPlus } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { useAuth } from "../context/AuthContext";
import { useDeletePost } from "../hooks/useDeletePost";
import { toaster } from "../components/ui/toaster";
import PostActions from "../components/PostActions"; // Import the PostActions component

interface PostDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  author: {
    username: string;
    avatar?: string;
  };
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

const PostDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deletePost } = useDeletePost();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${id}/detail`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/post/${id}/comments`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (location.state?.openCommentForm && user) {
      setShowCommentForm(true);
    }
  }, [location.state, user]);

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toaster.create({
        title: "Error",
        description: "Comment cannot be empty",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    if (!user?.id) {
      toaster.create({
        title: "Error",
        description: "You must be logged in to comment",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(`http://localhost:3001/api/post/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent.trim(),
          authorId: user.id,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // Add the new comment to the beginning of the array (since backend orders by createdAt desc)
        setComments([newComment, ...comments]);
        setCommentContent("");
        setShowCommentForm(false);
        toaster.create({
          title: "Success",
          description: "Comment added successfully",
          type: "success",
          duration: 3000,
          closable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }
    } catch (err) {
      console.error("Failed to submit comment", err);
      toaster.create({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit comment",
        type: "error",
        duration: 3000,
        closable: true,
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCancelComment = () => {
    setCommentContent("");
    setShowCommentForm(false);
  };

  const handleUpvoteUpdate = (newUpvotes: number) => {
    if (post) {
      setPost({ ...post, upvotes: newUpvotes });
    }
  };

  const handleEditClick = () => {
    if (post) {
      navigate(`/edit/${post.id}`, { state: { post } });
    }
  };

  const handleDeleteClick = () => {
    if (post) {
      deletePost(post.id, () => navigate('/feed'));
    }
  };

  const handleCommentClick = () => {
    if (!user) {
      toaster.create({
        title: "Error",
        description: "You must be logged in to comment",
        type: "error",
        duration: 3000,
      });
      return;
    }
    setShowCommentForm(true);
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>Post not found.</Text>
      </Box>
    );
  }

  // Create a post object that matches the PostActions interface
  const postForActions = {
    id: post.id,
    upvotes: post.upvotes,
    author: {
      username: post.author.username,
    },
    commentCount: comments.length, // Use the actual comments count
  };

  return (
    <Box maxW="xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      {/* Back Button and Title in Same Line */}
      <Flex align="center" mb={6}>
        <IconButton
          variant="ghost"
          onClick={() => navigate('/feed')}
          aria-label="Back to Feed"
          mr={3}
        >
          <BiArrowBack />
        </IconButton>
        <Heading size="lg" color="teal.600">
          Post Details
        </Heading>
      </Flex>

      {/* Title & Avatar */}
      <Stack direction="row" align="center" spaceX={4} mb={4}>
        {post.author.avatar ? (
          <Image
            boxSize="40px"
            borderRadius="full"
            src={post.author.avatar}
            alt={post.author.username}
          />
        ) : (
          <Box
            boxSize="40px"
            borderRadius="full"
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            color="gray.600"
          >
            {post.author.username.charAt(0).toUpperCase()}
          </Box>
        )}
        <Heading size="md">{post.title}</Heading>
      </Stack>

      {/* Content */}
      <Text mb={4}>{post.content}</Text>

      {/* Author and Date */}
      <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500" mb={2}>
        <Text>By {post.author.username}</Text>
        <Text>{new Date(post.createdAt).toLocaleString()}</Text>
      </Stack>

      {/* Post Actions - Replace the entire actions section */}
      <Box mt={2}>
        <PostActions
          post={postForActions}
          onUpvoteUpdate={handleUpvoteUpdate}
          onCommentClick={handleCommentClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </Box>

      {/* Comments Section */}
      <Box mt={6}>
        <Flex align="center" justify="space-between" mb={3}>
          <Heading size="sm">Comments</Heading>
          {user && (
            <IconButton
              size="sm"
              variant="outline"
              onClick={() => setShowCommentForm(true)}
              disabled={showCommentForm}
            >
              <BiPlus/>
            </IconButton>
          )}
        </Flex>

        {/* Comment Form */}
        {showCommentForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box mb={4} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your comment here..."
                resize="vertical"
                minH="100px"
                mb={3}
                bg="white"
              />
              <Flex gap={2}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={handleSubmitComment}
                  loading={submittingComment}
                  loadingText="Submitting..."
                >
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelComment}
                  disabled={submittingComment}
                >
                  Cancel
                </Button>
              </Flex>
            </Box>
          </motion.div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <Spinner />
        ) : comments.length === 0 ? (
          <Text color="gray.500">No comments yet.</Text>
        ) : (
          <Stack spaceY={4}>
            {comments.map(comment => (
              <Box key={comment.id} p={3} bg="gray.50" borderRadius="md" shadow="sm">
                <Text fontSize="sm" mb={1}>"{comment.content}"</Text>
                <Stack direction="row" justify="space-between" fontSize="xs" color="gray.500">
                  <Text>by {comment.author.username}</Text>
                  <Text>{new Date(comment.createdAt).toLocaleString()}</Text>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PostDetail;