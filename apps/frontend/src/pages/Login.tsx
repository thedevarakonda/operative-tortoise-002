import { useState } from 'react';
import { Box, Button, Heading, Input, Stack, createToaster } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const toaster = createToaster({
  placement: 'top',
});

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toaster.create({
        title: 'Please enter a username',
      });
      return;
    }

    const user = {
      id: Date.now(), // Generate a simple ID
      username: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Generate avatar URL
    };

    await login(user);
    navigate('/feed');
  };

 return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" px={4}>
      <Box bg="white" p={8} rounded="lg" shadow="lg" w="full" maxW="sm">
        <Heading mb={6} size="lg" textAlign="center">
          Welcome Back
        </Heading>
        <form>
          <Stack>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="md"
            />
            <Button colorScheme="blue" onClick={handleSubmit}>
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
