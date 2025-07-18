import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Button,
  Image,
  IconButton,
  Input,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BiEdit, BiArrowBack } from "react-icons/bi";
import { useDeletePost } from "../hooks/useDeletePost";
import { toaster } from "../components/ui/toaster";
import PostActions from "../components/PostActions"; // Import the PostActions component
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  bio? : string
}

interface Post {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
  upvotes: number;
  author?: {
    username: string;
  };
  commentCount?: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { username } = useParams();
  const { deletePost } = useDeletePost();

  // Fetch userId if not in state
  useEffect(() => {
    if (state?.userId) {
      setUserId(state.userId);
      return;
    }

    const fetchUserId = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/profile/username-to-id/${username}`);
        const data = await res.json();
        if (data?.id) setUserId(data.id);
        else throw new Error("User not found");
      } catch (err) {
        console.error("Error fetching user ID from username:", err);
        setLoading(false);
      }
    };

    if (username) fetchUserId();
  }, [state?.userId, username]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!userId) return;

      try {
        const profileRes = await fetch(`http://localhost:3001/api/profile/${userId}`);
        const profileData = await profileRes.json();
        setProfile(profileData);

        const postsRes = await fetch(`http://localhost:3001/api/profile/${userId}/posts`);
        const postsData = await postsRes.json();

        // Fetch comment counts for each post
        const postsWithCommentCounts = await Promise.all(
          postsData.map(async (post: Post) => {
            try {
              const commentCountRes = await fetch(`http://localhost:3001/api/post/${post.id}/comments/count`);
              const commentCountData = await commentCountRes.json();
              return { ...post, commentCount: commentCountData.count || 0 };
            } catch (error) {
              console.error(`Failed to fetch comment count for post ${post.id}:`, error);
              return { ...post, commentCount: 0 };
            }
          })
        );

        setPosts(postsWithCommentCounts);
      } catch (err) {
        console.error("Failed to fetch profile or posts", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfileAndPosts();
  }, [userId]);

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

  const handleUpvoteUpdate = (postId: number, newUpvotes: number) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, upvotes: newUpvotes } : p))
    );
  };

  const handleEditClick = (post: Post) => {
    navigate(`/edit/${post.id}`, { state: { post } });
  };

  const handleDeleteClick = (postId: number) => {
    deletePost(postId, () => navigate('/feed'));
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>Unable to load profile.</Text>
      </Box>
    );
  }

  const handleSaveBio = async () => {
    if (!editedBio.trim() || !userId) return;
    try {
      const response = await fetch(`http://localhost:3001/api/profile/${userId}/update-bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedBio: editedBio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bio");
      }

      profile.bio = editedBio;
      setIsEditingBio(false);
      toaster.create(
        {
          title:'Bio Update successful !',
          type:'success',
          duration: 1500
        }
      )
    } catch (error) {
      console.error("Error updating bio:", error);
      toaster.create(
        {
          title:'Error updating Bio :(',
          type:'error',
          duration: 1500
        }
      )
    }
  };

  const joinedDate = new Date(profile.createdAt).toLocaleDateString();

  return (
    <Box maxW="3xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      {/* Back Button - Top Left */}
      <Box mb={6}>
        <IconButton
          variant="ghost"
          onClick={() => navigate('/feed')}
          alignSelf="flex-start"
        >
          <BiArrowBack/>
        </IconButton>
      </Box>

      <Stack align="center" mb={6}>
        <Image alt={profile.name} src={profile.avatar} borderRadius="full" boxSize="100px" />
        <Heading size="md">{profile.name}</Heading>
        <Text fontSize="sm" color="gray.600">{profile.email}</Text>
        <Text>Joined on: <strong>{joinedDate}</strong></Text>

        <Box w="100%" mt={4}>
          <Text fontWeight="bold" mb={1}>Bio</Text>

          {user?.id === userId ? (
            !isEditingBio ? (
              <Flex align="center" justify="space-between">
                <Text color="gray.700" flex="1">{profile.bio || "No bio set."}</Text>
                <IconButton
                  size="md"
                  variant={'ghost'}
                  aria-label="Edit Bio"
                  onClick={() => {
                    setEditedBio(profile.bio || "");
                    setIsEditingBio(true);
                  }}
                  color={'blue.500'}
                >
                  <BiEdit />
                </IconButton>
              </Flex>
            ) : (
              <Flex direction="column" gap={2}>
                <Input
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleSaveBio}
                  alignSelf="flex-start"
                >
                  Save
                </Button>
              </Flex>
            )
          ) : (
            <Text color="gray.700">{profile.bio || "No bio set."}</Text>
          )}
        </Box>
      </Stack>

      <Box>
        <Heading size="md" mb={4}>Posts by {profile.name}</Heading>
        {posts.length === 0 ? (
          <Text color="gray.500">No posts yet.</Text>
        ) : (
          posts.map((post) => (
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0px 4px 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => navigate(`/post/${post.id}`, { state: { post } })}
              key={post.id}
            >
              <Box p={6} bg="white" rounded="md" shadow="sm" mb={6}>
                <Heading size="sm" mb={2}>{post.title}</Heading>
                <Text mb={3}>{post.content}</Text>
                <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
                  <Text>by {post.author?.username}</Text>
                  <Text>{formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</Text>
                </Stack>

                {/* Replace the entire actions section with PostActions component */}
                <Box mt={3}>
                  <PostActions
                    post={post}
                    showUpvote={true}
                    showComment={true}
                    showEdit={true}
                    showDelete={true}
                    onUpvoteUpdate={(newUpvotes) => handleUpvoteUpdate(post.id, newUpvotes)}
                    onCommentClick={() => handleCommentClick(post.id)}
                    onEditClick={() => handleEditClick(post)}
                    onDeleteClick={() => handleDeleteClick(post.id)}
                    size="xs"
                    spacing={2}
                    direction="row"
                    justify="space-between"
                    stopPropagation={true}
                  />
                </Box>
              </Box>
            </motion.div>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Profile;