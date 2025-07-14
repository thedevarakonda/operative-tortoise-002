import { useState,useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Stack,
  Spinner,
  Flex,
  IconButton
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toaster } from '../components/ui/toaster'; 
import { BiArrowBack } from 'react-icons/bi';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toaster.create({
        title: 'You must be logged in to post!',
        type: 'error',
        closable: true,
        duration: 2000,
      });
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
  if (!title || !content) {
    toaster.create({
      title: 'Title and content are required',
      type: 'error',
      closable: true,
      duration: 2000,
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const res = await fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        authorId: user?.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toaster.create({
        title: data.error || 'Failed to create post',
        type: 'error',
      });
      return;
    }

  toaster.create({ title: 'Creating your post...', type: 'info' });
  setIsRedirecting(true); // Trigger spinner

  setTimeout(() => {
    navigate('/feed', { state: { from: 'new' } });
  }, 2000);

  } catch (err) {
    console.error(err);
    toaster.create({ title: 'Something went wrong', type: 'error' });
  } finally {
    setIsSubmitting(false);
  }
};
  if (isRedirecting) {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Spinner size="xl" color="teal.500"  />
    </Box>
  );
}

  return (
  <Box maxW="lg" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
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
        Create a New Post
      </Heading>
    </Flex>
    
    <Stack>
      <Input
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Write your content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <Button
        colorScheme="teal"
        onClick={handleSubmit}
        loading={isSubmitting}
      >
        Publish
      </Button>
    </Stack>
  </Box>
);

};

export default NewPost;
