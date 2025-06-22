import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  Button,
  Badge,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { BiSolidUpvote } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Post {
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

const Feed = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Box minH="100vh" bg="gray.100" py={12} px={4}>
      <Box
        bg="white"
        rounded="lg"
        shadow="md"
        maxW="xl"
        mx="auto"
        p={6}
        textAlign="center"
        mb={8}
      >
        <Box
          w="96px"
          h="96px"
          rounded="full"
          overflow="hidden"
          mx="auto"
          mb={4}
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            <Text fontSize="2xl" fontWeight="bold" color="gray.500">
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>

        <Stack gap={4} align="center">
          <Heading size="md">Hello, {user?.username} 👋</Heading>
          <Text color="gray.600">Welcome to your feed.</Text>
          <Button onClick={handleLogout} colorScheme="red" size="sm">
            Logout
          </Button>
        </Stack>
      </Box>

      <Box maxW="xl" mx="auto">
        {loading ? (
          <Spinner />
        ) : (
          <Stack>
            {posts.map((post) => (
              <Box key={post.id} p={6} bg="white" rounded="md" shadow="sm">
                <Heading size="sm" mb={2}>
                  {post.title}
                </Heading>
                <Text mb={3}>{post.content}</Text>
                <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
                  <Text>by {post.author?.username}</Text>
                  <Text>{new Date(post.createdAt).toLocaleString()}</Text>
                </Stack>
                <Stack mt={3} direction="row" align="center">
                  <IconButton size="xs" aria-label="Upvote" variant="ghost">
                    <BiSolidUpvote />
                  </IconButton>
                  <Badge colorScheme="blue">{post.upvotes}</Badge>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Feed;