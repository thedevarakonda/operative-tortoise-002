// apps/frontend/src/components/NotificationPanel.tsx
import { Box, Text, VStack, Link as ChakraLink, Image, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import type { Notification } from '../hooks/useNotifications'; // Assuming your hook and types are set up
 // Assuming your hook and types are set up

interface NotificationPanelProps {
  notifications: Notification[];
}

const NotificationPanel = ({ notifications }: NotificationPanelProps) => {
  return (
    <Box
      position="absolute"
      top="120%" // Position it just below the bell icon
      right={0}
      mt={2}
      w="380px"
      bg="white"
      color="black" // Set text color to be readable on a white background
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="lg"
      zIndex={20} // Ensure it appears above other content
    >
      <VStack align="stretch">
        {notifications.length === 0 ? (
          <Text p={4} fontSize="sm" color="gray.500">
            You have no new notifications.
          </Text>
        ) : (
          notifications.map((notif) => (
            // Each notification links to the specific post
            <ChakraLink 
              as={RouterLink} 
              // to={`/post/${notif.post.id}`} 
              key={notif.id} 
              _hover={{ textDecoration: 'none' }}
            >
              <Flex
                p={3}
                align="center"
                borderBottom="1px solid"
                borderColor="gray.100"
                bg={!notif.read ? 'teal.50' : 'transparent'} // Highlight unread notifications
                _hover={{ bg: 'gray.100' }}
                transition="background-color 0.2s"
              >
                <Image src={notif.sender.avatar} boxSize="50px"
                        borderRadius="full"
                        fit="cover"/>
                <Text ml={3} fontSize="sm">
                  <Text as="span" fontWeight="bold">{notif.sender.username}</Text>
                  {notif.type === 'NEW_COMMENT'
                    ? ` commented on your post "${notif.post.title}".`
                    : ' upvoted your post.'}
                </Text>
              </Flex>
            </ChakraLink>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationPanel;