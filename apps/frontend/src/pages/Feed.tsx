import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toaster } from '../components/ui/toaster';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PostActions from '../components/PostActions';

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
  commentCount?: number;
}

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const MotionButton = motion(Button);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const POSTS_PER_PAGE = 5;

  useEffect(() => {
    if (location.state?.from === 'new') {
      toaster.create({ title: 'Post created successfully 🎉', type: 'success', duration: 2000 });
    } else if (location.state?.from === 'login') {
      toaster.create({ title: `Welcome back, ${user?.username}!`, type: 'success', duration: 2000 });
    } else if (location.state?.from === 'edit') {
      toaster.create({ title: `Post edited successfully!`, type: 'success', duration: 2000 });
    }
  }, []);

  const fetchPosts = async (page = 1) => {
    setFilterLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/other-posts/${user?.id}?page=${page}&limit=${POSTS_PER_PAGE}`);
      const { posts, total } = await res.json();

      const postsWithCounts = await Promise.all(
        posts.map(async post => {
          try {
            const res = await fetch(`http://localhost:3001/api/post/${post.id}/comments/count`);
            const countData = await res.json();
            return { ...post, commentCount: countData.count };
          } catch {
            return { ...post, commentCount: 0 };
          }
        })
      );

      setAllPosts(postsWithCounts);
      setTotalPages(Math.ceil(total / POSTS_PER_PAGE));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPosts(currentPage);
    }
  }, [user?.id, currentPage]);

  useEffect(() => {
    if (filter === 'all') {
      setPosts(allPosts);
    } else {
      const userPosts = allPosts.filter(post => post.author?.username === user?.username);
      setPosts(userPosts);
    }
  }, [filter, allPosts, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleCommentClick = (postId: number) => {
    if (!user) {
      toaster.create({
        title: "Error",
        description: "You must be logged in to comment",
        type: "error",
        duration: 3000,
      });
      return;
    }

    navigate(`/post/${postId}`, {
      state: {
        openCommentForm: true
      }
    });
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg="gray.100" py={12} px={4}>
        <Box maxW="xl" mx="auto">
          <Stack direction="row" mb={4} justify="center">
            <MotionButton
              bgColor="green.500"
              color="white"
              onClick={() => navigate('/new')}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              + New Post
            </MotionButton>
          </Stack>

          {loading || filterLoading ? (
            <Spinner />
          ) : (
            <Stack>
              {posts.map(post => (
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
                  key={post.id}
                >
                  <Box p={6} bg="white" rounded="md" shadow="sm">
                    <Heading size="sm" mb={2}>{post.title}</Heading>
                    <Text mb={3}>{post.content}</Text>
                    <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
                      <Text>by {post.author?.username}</Text>
                      <Text>{new Date(post.updatedAt).toLocaleString()}</Text>
                    </Stack>
                    <Box mt={3}>
                      <PostActions
                        post={post}
                        showUpvote={true}
                        showComment={true}
                        showEdit={false}
                        showDelete={false}
                        onUpvoteUpdate={(newUpvotes) =>
                          setPosts(prev =>
                            prev.map(p => (p.id === post.id ? { ...p, upvotes: newUpvotes } : p))
                          )
                        }
                        onCommentClick={() => handleCommentClick(post.id)}
                      />
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          )}

          {totalPages > 1 && (
            <Stack direction="row" justify="center" mt={6} spaceX={4}>
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text alignSelf="center">Page {currentPage} of {totalPages}</Text>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Feed;
