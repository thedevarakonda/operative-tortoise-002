import {
  Box,
  Heading,
  Text,
  Stack,
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
import Navbar from '../components/Navbar';
import { useUpvote } from '../hooks/useUpvote';
import { useDeletePost } from '../hooks/useDeletePost';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
  const { hasUpvoted, toggleUpvote } = useUpvote();
  const location = useLocation();
  const {deletePost} = useDeletePost(); 

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

  const handleDelete = (postId: number) => {
    deletePost(postId, () =>
      setPosts(prev => prev.filter(post => post.id !== postId))
    );
  };

  return (
    <Box minH="100vh" bg="gray.100" py={12} px={4}>
      <Navbar/>

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
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                  key={post.id}
                >
                <Box 
                  key={post.id} p={6} bg="white" rounded="md" shadow="sm" 
                >
                  <Heading size="sm" mb={2}>
                    {post.title}
                  </Heading>
                  <Text mb={3}>{post.content}</Text>
                  <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
                    <Text>by {post.author?.username}</Text>
                    <Text>{new Date(post.updatedAt).toLocaleString()}</Text>
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
                      onClick={(e) =>{
                        e.stopPropagation();
                        toggleUpvote(post.id, post.upvotes, (newUpvotes) =>
                          setPosts(prev =>
                            prev.map(p => (p.id === post.id ? { ...p, upvotes: newUpvotes } : p))
                          )
                        )
                      }
                      }
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
                            handleDelete(post.id);
                          }}
                        >  
                          <BiTrash/>
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Box>
                </motion.div>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Feed;
