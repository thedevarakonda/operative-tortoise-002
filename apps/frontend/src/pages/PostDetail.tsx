import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  IconButton,
  Spinner,
  Flex,
  Button,
  Textarea
} from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDeletePost } from "../hooks/useDeletePost";
import PostActions from "../components/PostActions";
import { formatDistanceToNow } from "date-fns";
import Comments from "../components/Comments";

interface PostDetail {
  id: number;
  title: string;
  content: string;
  mediaUrl?: string; // 👈 Add the mediaUrl field
  createdAt: string;
  upvotes: number;
  author: {
    username: string;
    avatar?: string;
  };
}

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deletePost } = useDeletePost();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${id}/detail`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpvoteUpdate = (newUpvotes: number) => {
    if (post) {
      setPost({ ...post, upvotes: newUpvotes });
    }
  };

  const handleEditClick = () => {
    if (post) {
      navigate(`/edit/${post.id}`, { state: { post } });
    }
  };

  const handleDeleteClick = () => {
    if (post) {
      deletePost(post.id, () => navigate('/feed'));
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>Post not found.</Text>
      </Box>
    );
  }

  const postForActions = {
    id: post.id,
    upvotes: post.upvotes,
    author: {
      username: post.author.username,
    },
  };

  // Determine if media is an image or video based on its file extension
  const isImage = post.mediaUrl && /\.(jpg|jpeg|png|gif)$/i.test(post.mediaUrl);
  const isVideo = post.mediaUrl && /\.(mp4|mov|avi|webm)$/i.test(post.mediaUrl);


  return (
    <Box maxW="xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      {/* Back Button and Title in Same Line */}
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
          Post Details
        </Heading>
      </Flex>

      {/* Title & Avatar */}
      <Stack direction="row" align="center" spaceX={4} mb={4}>
        {post.author.avatar ? (
          <Image
            boxSize="40px"
            borderRadius="full"
            src={post.author.avatar}
            alt={post.author.username}
          />
        ) : (
          <Box
            boxSize="40px"
            borderRadius="full"
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            color="gray.600"
          >
            {post.author.username.charAt(0).toUpperCase()}
          </Box>
        )}
        <Heading size="md">{post.title}</Heading>
      </Stack>

      {/* Media */}
      {isImage && (
        <Image src={`http://localhost:3001${post.mediaUrl}`} alt={post.title} mt={4} maxH="500px" objectFit="contain" />
      )}
      {isVideo && (
        <video>
          <source src={`http://localhost:3001${post.mediaUrl}`} type="video/mp4" />
        </video>
      )}

      {/* Content */}
      <Text my={4}>{post.content}</Text>

      {/* Author and Date */}
      <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500" mb={2}>
        <Text>By {post.author.username}</Text>
        <Text>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</Text>
      </Stack>

      {/* Post Actions - Replace the entire actions section */}
      <Box mt={2}>
        <PostActions
          post={postForActions}
          onUpvoteUpdate={handleUpvoteUpdate}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </Box>

      {/* Comments Section */}
      <Comments postId={post.id} user={user} />
    </Box>
  );
};

export default PostDetail;