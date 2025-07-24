// apps/frontend/src/pages/NewPost.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Stack,
  Spinner,
  Flex,
  IconButton,
  Image,       // 👈 Import Image for preview
  Text,        // 👈 Import Text for error message
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toaster } from '../components/ui/toaster';
import { BiArrowBack } from 'react-icons/bi';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
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

  useEffect(() => {
    if (mediaFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(mediaFile);
    } else {
      setMediaPreview(null);
    }
  }, [mediaFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'video/webm'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toaster.create({
          title: 'Invalid file type. Only images (jpeg, png, gif) and videos (mp4, mov, avi, webm) are allowed.',
          type: 'error',
          closable: true,
          duration: 3000,
        });
        setMediaFile(null);
        return;
      }

      if (file.size > maxFileSize) {
        toaster.create({
          title: `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit.`,
          type: 'error',
          closable: true,
          duration: 3000,
        });
        setMediaFile(null);
        return;
      }

      setMediaFile(file);
    } else {
      setMediaFile(null);
    }
  };

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('authorId', user?.id || '');

      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        body: formData,
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
      setIsRedirecting(true);

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
        <Spinner size="xl" color="teal.500" />
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

      <Stack spaceX={4}>
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
        {/* Removed FormControl and FormLabel */}
        <Text mb={1} fontSize="sm" color="gray.600">Upload Media (Image or Video)</Text> {/* A simple text label */}
        <Input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          p={1}
        />
        {mediaPreview && (
          mediaFile?.type.startsWith('image/') ? (
            <Image src={mediaPreview} alt="Media preview" mt={4} maxH="200px" objectFit="contain" />
          ) : (
            <video src={mediaPreview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
          )
        )}
        {!mediaFile && mediaPreview === null && (
          <Text fontSize="sm" color="gray.500" mt={2}>Max 5MB. Formats: JPG, PNG, GIF, MP4, MOV, AVI, WEBM.</Text>
        )}

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Publish
        </Button>
      </Stack>
    </Box>
  );
};

export default NewPost;