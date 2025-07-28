// apps/frontend/src/pages/NotificationsPage.tsx
import {
  Box,
  Heading,
  VStack,
  Text,
  Link as ChakraLink,
  Flex,
  Image,
  Spinner,
  IconButton
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAllNotifications } from '../hooks/useAllNotifications';
import { BiArrowBack } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, isLoading } = useAllNotifications();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="700px" mx="auto" mt={8} p={4}>
       <Flex align="center" mb={6}>
        <IconButton
          aria-label="Go back"
          variant="ghost"
          onClick={() => navigate(-1)} // Go back to the previous page
          mr={3}
        >
          <BiArrowBack />
        </IconButton>
        <Heading size="lg">All Notifications</Heading>
      </Flex>

      <VStack spaceX={3} align="stretch">
        {notifications.length === 0 ? (
          <Text color="gray.500" textAlign="center" mt={10}>
            You don't have any notifications yet.
          </Text>
        ) : (
          notifications.map((notif) => (
            <ChakraLink 
              as={RouterLink} 
              to={`/post/${notif.post.id}`} 
              key={notif.id} 
              _hover={{ textDecoration: 'none' }}
            >
              <Flex
                p={4}
                align="center"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg={!notif.read ? 'teal.50' : 'white'}
                _hover={{ bg: 'gray.100' }}
                transition="background-color 0.2s"
              >
                <Image boxSize="40px" borderRadius="full" src={notif.sender.avatar} />
                <Box ml={4}>
                  <Text>
                    <Text as="span" fontWeight="bold">{notif.sender.username}</Text>
                    {notif.type === 'NEW_COMMENT'
                      ? ` commented on your post: "${notif.post.title}"`
                      : ` upvoted your post: "${notif.post.title}"`}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </Text>
                </Box>
              </Flex>
            </ChakraLink>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationsPage;