import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Image,
  Stack,
  Button,
} from "@chakra-ui/react";

interface PostDetailData {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  author: {
    username: string;
    avatar: string;
  };
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${id}/detail`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box p={6} textAlign="center">
        <Text>Post not found.</Text>
        <Button mt={4} onClick={() => navigate("/feed")}>Back to Feed</Button>
      </Box>
    );
  }

  return (
    <Box maxW="3xl" mx="auto" p={6} bg="white" rounded="md" shadow="md" mt={6}>
      <Stack direction="row" align="center" mb={4}>
        <Image src={post.author.avatar} alt={post.author.username} />
        <Text fontWeight="bold">{post.author.username}</Text>
        <Text color="gray.500">{new Date(post.createdAt).toLocaleString()}</Text>
      </Stack>
      <Heading size="lg" mb={2}>{post.title}</Heading>
      <Text fontSize="md" mb={4}>{post.content}</Text>
      <Text color="gray.600">Upvotes: {post.upvotes}</Text>
      <Button mt={4} onClick={() => navigate("/feed")}>Back to Feed</Button>
    </Box>
  );
};

export default PostDetail;
