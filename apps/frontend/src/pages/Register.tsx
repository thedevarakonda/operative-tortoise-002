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
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!username) {
      toaster.create({ 
        title: 'Username is required',
        type: "error"
      });
      return;
    }

    const newUser = {
      id: Date.now(),
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };

    login(newUser);
    navigate('/feed');
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" px={4}>
      <Box bg="white" p={8} rounded="lg" shadow="lg" w="full" maxW="sm">
        <Heading mb={6} size="lg" textAlign="center">
          Create an Account
        </Heading>
        <form>
          <Stack gap={4}>
            <Input
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="md"
            />
            <Button colorScheme="teal" onClick={handleRegister}>
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