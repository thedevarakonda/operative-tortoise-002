import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Spinner
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toaster } from '../components/ui/toaster'; 


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      toaster.create({
        title: 'Both fields are required',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toaster.create({
          title: data.error || 'Login failed',
          type: 'error',
        });
        return;
      }

      login(data.user);


      setIsRedirecting(true); // Show spinner
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
    } catch (err) {
      console.error(err);
      toaster.create({
        title: 'Network error. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if(isRedirecting){
    return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Spinner size="xl" color="blue.500" />
    </Box>
  );
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" px={4}>
      <Box bg="white" p={8} rounded="lg" shadow="lg" w="full" maxW="sm">
        <Heading mb={6} size="lg" textAlign="center">
          Welcome Back
        </Heading>
        <Stack gap={4}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="md"
            disabled={isSubmitting}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="md"
            disabled={isSubmitting}
          />
          <Button
            colorScheme="blue"
            onClick={handleLogin}
            loading={isSubmitting}
            loadingText="Logging in..."
          >
            Login
          </Button>
          <Text fontSize="sm" textAlign="center">
            New here?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Create an account
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;