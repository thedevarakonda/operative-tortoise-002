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
import { BiSolidUpvote,BiComment} from 'react-icons/bi';
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
  commentCount?: number;
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
  const MotionButton = motion(Button);
 
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
        const res = await fetch(`http://localhost:3001/api/other-posts/${user?.id}`);
        const data: Post[] = await res.json();

        // Fetch comment counts for each post
        const postsWithCounts = await Promise.all(
          data.map(async post => {
            try {
              const res = await fetch(`http://localhost:3001/api/post/${post.id}/comments/count`);
              const countData = await res.json();
              console.log(countData);
              return { ...post, commentCount: countData.count };
            } catch (err) {
              console.error('Failed to fetch comment count for post', post.id);
              return { ...post, commentCount: 0 };
            }
          })
        );

        setAllPosts(postsWithCounts);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPosts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (filter === 'all') {
      setPosts(allPosts);
    } else {
      const userPosts = allPosts.filter(post => post.author?.username === user?.username);
      setPosts(userPosts);
    }
  }, [filter, allPosts, user]);

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
    
    // Navigate to post detail with flag to open comment form
    navigate(`/post/${postId}`, { 
      state: { 
        openCommentForm: true 
      } 
    });
  };

  return (
    <>
    <Navbar/>
    <Box minH="100vh" bg="gray.100" py={12} px={4}>
      

      <Box maxW="xl" mx="auto">
        <Stack direction="row"  mb={4} justify="center">
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
            {posts.map(post => {
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
                    <Stack direction="row" spaceX={-2} align="center">
                      <motion.div
                        whileTap={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <IconButton
                          size="xs"
                          aria-label="Upvote"
                          variant={hasUpvoted(post.id) ? 'solid' : 'ghost'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUpvote(post.id, post.upvotes, (newUpvotes) =>
                              setPosts(prev =>
                                prev.map(p => (p.id === post.id ? { ...p, upvotes: newUpvotes } : p))
                              )
                            )
                          }}
                        >
                          <BiSolidUpvote />
                        </IconButton>
                      </motion.div>
                      <Badge size="sm" variant="plain">{post.upvotes}</Badge>
                    </Stack>

                    {/* Comment group */}
                    <Stack direction="row" spaceX={-3} align="center">
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Comment"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentClick(post.id);
                        }}
                      >
                        <BiComment />
                        <Badge size="sm" variant='plain'>{post.commentCount ?? 0}</Badge>
                      </IconButton>
                      
                    </Stack>
                  </Stack>
                </Box>
                </motion.div>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
    </>
  );
};

export default Feed;