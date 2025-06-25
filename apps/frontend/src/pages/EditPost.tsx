import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toaster } from '../components/ui/toaster';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;

  useEffect(() => {
  if (post) {
    setTitle(post.title);
    setContent(post.content);
    setLoading(false);
  } else {
    toaster.create({ title: 'No post data found', type: 'error' });
    navigate('/feed'); // fallback
  }
}, []);

  const handleSubmit = async () => {
    if (!title || !content) {
      toaster.create({
        title: 'Title and content are required',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3001/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        toaster.create({
          title: data.error || 'Failed to update post',
          type: 'error',
        });
        return;
      }

      toaster.create({ title: 'Updating your post...', type: 'info' });
      setIsRedirecting(true);

      setTimeout(() => {
        navigate('/feed');
      }, 1500);
    } catch (err) {
      console.error(err);
      toaster.create({ title: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isRedirecting) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Heading mb={6}>Edit Your Post</Heading>
      <Stack>
        <Input
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Update your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
};

export default EditPost;
