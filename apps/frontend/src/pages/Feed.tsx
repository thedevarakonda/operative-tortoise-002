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
import { BiSolidUpvote,BiEdit, BiTrash } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toaster } from '../components/ui/toaster';
import { motion } from 'framer-motion';

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
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (location.state?.from === 'new') {
      toaster.create({ title: 'Post created successfully 🎉', type: 'success', duration: 2000 });
    } else if (location.state?.from === 'login') {
      toaster.create({ title: `Welcome back, ${user?.username}!`, type: 'success', duration: 2000 });
    } else if (location.state?.from === 'edit') {
      toaster.create({ title: `Post edited successfully !`, type: 'success', duration: 2000 });
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/posts');
        const data = await res.json();
        setAllPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setPosts(allPosts);
    } else {
      const userPosts = allPosts.filter(post => post.author?.username === user?.username);
      setPosts(userPosts);
    }
  }, [filter, allPosts, user]);

  const handleFilterChange = (type: 'all' | 'mine') => {
    if (type === filter) return;
    setFilterLoading(true);
    setTimeout(() => {
      setFilter(type);
      setFilterLoading(false);
    }, 300);
  };

  const handleUpvote = async (postId: number) => {
    const localKey = `upvoted_${postId}`;
    const hasVoted = localStorage.getItem(localKey);

    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}/${hasVoted ? 'unvote' : 'upvote'}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error();

      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, upvotes: post.upvotes + (hasVoted ? -1 : 1) } : post
        )
      );

      if (hasVoted) {
        localStorage.removeItem(localKey);
      } else {
        localStorage.setItem(localKey, 'true');
      }
    } catch (err) {
      toaster.create({ title: 'Failed to update vote', type: 'error' });
    }
  };

  const handleDelete = async (postId: number) => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    try {
      console.log(`Calling URL http://localhost:3001/api/posts/${postId}`)
      const res = await fetch(`http://localhost:3001/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPosts(prev => prev.filter(post => post.id !== postId));
      toaster.create({ title: 'Post deleted successfully', type: 'success' });
    } catch (err) {
      toaster.create({ title: 'Failed to delete post', type: 'error' });
    }
  };

  const hasUpvoted = (postId: number) => {
    return localStorage.getItem(`upvoted_${postId}`) === 'true';
  };

  return (
    <Box minH="100vh" bg="gray.100" py={12} px={4}>
      <Box
        bg="white"
        rounded="xl"
        shadow="xl"
        maxW="xl"
        mx="auto"
        p={6}
        textAlign="center"
        mb={8}
        transition="all 0.3s"
        _hover={{ shadow: "2xl" }}
      >
        <Box
          w="96px"
          h="96px"
          rounded="full"
          overflow="hidden"
          mx="auto"
          mb={4}
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="2px solid"
          borderColor="gray.200"
          cursor="pointer"
          transition="transform 0.2s"
          _hover={{ transform: "scale(1.05)" }}
          onClick={() => navigate("/profile")}
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

        <Stack spaceX ={3} align="center">
          <Heading size="md">Hello, {user?.username} 👋</Heading>
          <Text color="gray.600" fontSize="sm">
            Welcome back to your feed.
          </Text>
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            colorScheme="red"
            _hover={{ bg: "red.50" }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      <Box maxW="xl" mx="auto">
        <Stack direction="row"  mb={4} justify="center">
          <Button bgColor={'green.500'} color="white" onClick={() => navigate('/new')}>
            + New Post
          </Button>
          <Button
            variant={filter === 'all' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => handleFilterChange('all')}
            disabled={filterLoading}
          >
            All Posts
          </Button>
          <Button
            variant={filter === 'mine' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => handleFilterChange('mine')}
            disabled={filterLoading}
          >
            My Posts
          </Button>
        </Stack>

        {loading || filterLoading ? (
          <Spinner />
        ) : (
          <Stack>
            {posts.map(post => {
              const isOwner = post.author?.username === user?.username;
              return (
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
                    <motion.div
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <IconButton
                      size="xs"
                      aria-label="Upvote"
                      variant={hasUpvoted(post.id) ? 'solid' : 'outline'}
                      colorScheme={hasUpvoted(post.id) ? 'blackAlpha' : 'gray'}
                      onClick={() => handleUpvote(post.id)}
                    >
                      <BiSolidUpvote/>
                      </IconButton>
                  </motion.div>
                    <Badge colorScheme="blue" size={'lg'}>{post.upvotes}</Badge>

                    {isOwner && (
                      <>
                        <IconButton
                          size="md"
                          aria-label="Edit"
                          variant='ghost'
                          color={'blue.500'}
                          onClick={() => navigate(`/edit/${post.id}`, { state: { post } })}
                        >  
                          <BiEdit />
                        </IconButton><IconButton
                          size="md"
                          aria-label="Delete"
                          variant='ghost'
                          color={'red'}
                          onClick={() => handleDelete(post.id)}
                        >  
                          <BiTrash/>
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Feed;
