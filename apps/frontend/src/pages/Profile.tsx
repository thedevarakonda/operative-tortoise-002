import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Button,
  Image
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`http://localhost:3001/api/profile/${user.id}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

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
    <Box maxW="md" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Stack align="center" >
        <Image alt={profile.name} src={profile.avatar} />
        <Heading size="md">{profile.name}</Heading>
        <Text fontSize="sm" color="gray.600">{profile.email}</Text>
        <Text>Joined on: <strong>{formattedDate}</strong></Text>
        <Text>Year: <strong>{joinedYear}</strong></Text>
        <Button colorScheme="blue" onClick={() => navigate('/change-password')}>
          Edit Password
        </Button>
      </Stack>
    </Box>
  );
};

export default Profile;
