import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  Button,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="gray.100" py={12} px={4}>
      <Box
        bg="white"
        rounded="lg"
        shadow="md"
        maxW="xl"
        mx="auto"
        p={6}
        textAlign="center"
      >
        <Box
          w="96px"
          h="96px"
          rounded="full"
          overflow="hidden"
          mx="auto"
          mb={4}
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            <Text fontSize="2xl" fontWeight="bold" color="gray.500">
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>

        <Stack gap={4} align="center">
          <Heading size="md">Hello, {user?.username} 👋</Heading>
          <Text color="gray.600">Welcome to your feed.</Text>
          <Button
            onClick={handleLogout}
            colorScheme="red"
            variant="solid"
            size="sm"
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Feed;