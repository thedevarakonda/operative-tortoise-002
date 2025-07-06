import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  IconButton,
  Badge,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { BiSolidUpvote,BiEdit,BiTrash,BiArrowBack } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { useUpvote } from '../hooks/useUpvote';
import { motion } from 'framer-motion';
import { useAuth } from "../context/AuthContext";
import { useDeletePost } from "../hooks/useDeletePost";

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
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasUpvoted, toggleUpvote } = useUpvote();
  const {user} = useAuth();
  const navigate = useNavigate();
  const { deletePost } = useDeletePost();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);


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

  const handleDelete = () => {
    deletePost(post.id, () => navigate('/feed'));
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

      {/* Upvote Section */}
      <Stack direction="row" align="center" mt={2}>
        <Stack direction="row" spaceX={-2} align="center">
          <motion.div
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <IconButton
              size="xs"
              aria-label="Upvote"
              variant={hasUpvoted(post.id) ? 'solid' : 'ghost'}
              onClick={() =>
                toggleUpvote(post.id, post.upvotes, (newUpvotes) =>
                  setPost({ ...post, upvotes: newUpvotes })
                )
              }
            >
              <BiSolidUpvote/>  
            </IconButton>
          </motion.div>
          <Badge size="sm" variant="plain">{post.upvotes}</Badge>
        </Stack>
        {(post.author.username === user?.username) && (
        <>
          <IconButton
            size="md"
            aria-label="Edit"
            variant='ghost'
            color={'blue.500'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${post.id}`, { state: { post } });
            }}
          >  
            <BiEdit />
          </IconButton><IconButton
            size="md"
            aria-label="Delete"
            variant='ghost'
            color={'red'}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >  
            <BiTrash/>
          </IconButton>
        </>
      )}
      </Stack>
      <Box mt={6}>
      <Heading size="sm" mb={3}>Comments</Heading>
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