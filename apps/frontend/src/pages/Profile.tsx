import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Button,
  Image,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;
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

    fetchProfileAndPosts();
  },[userId]);

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

  const joinedDate = new Date(profile.createdAt);
  const formattedDate = joinedDate.toLocaleDateString();
  const joinedYear = joinedDate.getFullYear();

  return (
    <Box maxW="3xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Stack align="center"  mb={6}>
        <Image alt={profile.name} src={profile.avatar} borderRadius="full" boxSize="100px" />
        <Heading size="md">{profile.name}</Heading>
        <Text fontSize="sm" color="gray.600">{profile.email}</Text>
        <Text>Joined on: <strong>{formattedDate}</strong></Text>
        {/* <Text>Year: <strong>{joinedYear}</strong></Text> */}

        {user?.id === userId && (
          <Button onClick={() => navigate('/change-password')}>
            Edit Password
          </Button>
        )}
        <Button onClick={() => navigate('/feed')}>Back</Button>
      </Stack>


      <Box>
        <Heading size="md" mb={4}>Posts by {profile.name}</Heading>
        {posts.length === 0 ? (
          <Text color="gray.500">No posts yet.</Text>
        ) : (
          posts.map((post) => (
            <Box key={post.id} p={4} mb={4} borderWidth="1px" borderRadius="md">
              <Heading size="sm">{post.title}</Heading>
              <Text fontSize="sm" color="gray.600">
                {new Date(post.updatedAt).toLocaleDateString()}
              </Text>
              <Text mt={2}>{post.content}</Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Profile;
