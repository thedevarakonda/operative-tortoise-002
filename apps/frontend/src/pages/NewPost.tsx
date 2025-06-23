import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Stack,
  createToaster,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const toaster = createToaster({ placement: 'top' });

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !content) {
      toaster.create({ title: 'Title and content are required', type: 'error' });
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
        toaster.create({ title: data.error || 'Failed to create post', type: 'error' });
        return;
      }

      toaster.create({ title: 'Post created successfully', type: 'success' });
      navigate('/feed');
    } catch (err) {
      console.error(err);
      toaster.create({ title: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Heading mb={6}>Create a New Post</Heading>
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
