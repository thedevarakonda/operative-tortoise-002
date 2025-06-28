import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  IconButton,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { BiSolidUpvote } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUpvote } from '../hooks/useUpvote';
import { motion } from 'framer-motion';
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

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasUpvoted, toggleUpvote } = useUpvote();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${id}/detail`);
        const data = await res.json();
        setPost(data); // assuming backend returns array of 1 item
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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

  return (
    <Box maxW="xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
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
        <motion.div
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
        <IconButton
          size="sm"
          aria-label="Upvote"
          variant={hasUpvoted(post.id) ? 'solid' : 'outline'}
          // colorScheme="gray"
          onClick={() =>
            toggleUpvote(post.id, post.upvotes, (newUpvotes) =>
              setPost({ ...post, upvotes: newUpvotes })
            )
          }
          // onClick={() => handleUpvote(post.id)} // to be implemented
        >
          <BiSolidUpvote/>  
        </IconButton>
        </motion.div>
        <Badge colorScheme="blue">{post.upvotes}</Badge>
      </Stack>
    </Box>
  );
};

export default PostDetail;
