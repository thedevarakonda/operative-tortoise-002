import { Box, Heading, Text, Stack, Image } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const { user } = useAuth();

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
        <Stack gap={2}>
          <Heading size="md">Hello, {user?.username} 👋</Heading>
          <Text color="gray.600">Welcome to your feed.</Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default Feed;