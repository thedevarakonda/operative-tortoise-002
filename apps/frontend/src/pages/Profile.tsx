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
  Badge,
  Input,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BiEdit, BiSolidUpvote, BiTrash } from "react-icons/bi";
import { useUpvote } from "../hooks/useUpvote";
import { useDeletePost } from "../hooks/useDeletePost";

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
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { hasUpvoted, toggleUpvote } = useUpvote();
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
        setPosts(postsData);
      } catch (err) {
        console.error("Failed to fetch profile or posts", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfileAndPosts();
  }, [userId]);

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

  const handleDelete = (postId:number) => {
    deletePost(postId, () => navigate('/feed'));
  };

  const handleSaveBio = () => {
    alert("Save bio clicked");
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString();

  return (
    <Box maxW="3xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Stack align="center" mb={6}>
        <Image alt={profile.name} src={profile.avatar} borderRadius="full" boxSize="100px" />
        <Heading size="md">{profile.name}</Heading>
        <Text fontSize="sm" color="gray.600">{profile.email}</Text>
        <Text>Joined on: <strong>{joinedDate}</strong></Text>

        {/* {user?.id == userId && (
          <Button onClick={() => navigate('/change-password')}>Edit Password</Button>
        )} */}

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
                  colorScheme="teal"
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
        <Button onClick={() => navigate('/feed')}>Back</Button>
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
              <Box p={6} bg="white" rounded="md" shadow="sm">
                <Heading size="sm" mb={2}>{post.title}</Heading>
                <Text mb={3}>{post.content}</Text>
                <Stack direction="row" justify="space-between" fontSize="sm" color="gray.500">
                  <Text>by {post.author?.username}</Text>
                  <Text>{new Date(post.updatedAt).toLocaleString()}</Text>
                </Stack>

                <Stack mt={3} direction="row" align="center">
                  <motion.div whileTap={{ scale: 1.3 }} transition={{ type: "spring", stiffness: 300 }}>
                    <IconButton
                      size="xs"
                      aria-label="Upvote"
                      variant={hasUpvoted(post.id) ? "solid" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUpvote(post.id, post.upvotes, (newUpvotes) =>
                          setPosts(prev =>
                            prev.map(p => (p.id === post.id ? { ...p, upvotes: newUpvotes } : p))
                          )
                        );
                      }}
                    >
                      <BiSolidUpvote />
                    </IconButton>
                  </motion.div>
                  <Badge colorScheme="blue" size="lg">{post.upvotes}</Badge>
                  {(post.author?.username === user?.username) && (
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
          ))
        )}
      </Box>
    </Box>
  );
};

export default Profile;
