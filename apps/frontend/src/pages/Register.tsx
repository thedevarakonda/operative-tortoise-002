import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  createToaster,
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const toaster = createToaster({ placement: 'top' });

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toaster.create({ title: 'All fields are required', type: 'error' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toaster.create({ title: data.error || 'Registration failed', type: 'error' });
        return;
      }

      login(data.user); // Set user in auth context
      navigate('/feed');
    } catch (err) {
      console.error(err);
      toaster.create({ title: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" px={4}>
      <Box bg="white" p={8} rounded="lg" shadow="lg" w="full" maxW="sm">
        <Heading mb={6} size="lg" textAlign="center">
          Create an Account
        </Heading>
        <form onSubmit={handleRegister}>
          <Stack gap={4}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="md"
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="md"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="md"
            />
            <Button colorScheme="teal" type="submit">
              Register
            </Button>
            <Text fontSize="sm" textAlign="center">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="blue.500">
                Log in
              </Link>
            </Text>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Register;