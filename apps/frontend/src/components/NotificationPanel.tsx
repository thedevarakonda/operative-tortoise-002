// apps/frontend/src/components/NotificationPanel.tsx
import 
{ Box, 
  Text, 
  VStack, 
  Link as ChakraLink, 
  Image, 
  Flex,
  IconButton
}   from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import type { Notification } from '../hooks/useNotifications'; 
import { BiX } from 'react-icons/bi';

interface NotificationPanelProps {
  notifications: Notification[];
  onClearAll: () => void;
}

const NotificationPanel = ({ notifications, onClearAll }: NotificationPanelProps) => {
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
      <Flex justify="space-between" align="center" p={2} borderBottom="1px solid" borderColor="gray.200">
        <Text fontWeight="bold" fontSize="md" ml={2}>Notifications</Text>
        {/* Only show the button if there are notifications to clear */}
        {notifications.length > 0 && (
            <IconButton
              aria-label="Clear all notifications"
              size="xs"
              variant="ghost"
              onClick={onClearAll} // Call the function passed via props
            >
              <BiX />
            </IconButton>  
        )}
      </Flex>
      <VStack align="stretch">
        {notifications.length === 0 ? (
          <Text p={4} fontSize="sm" color="gray.500">
            You have no new notifications.
          </Text>
        ) : (
          notifications.map((notif) => {
            // Each notification links to the specific post
            if (!notif.post || !notif.sender) {
              return null;
            }
            return(
              <ChakraLink 
                as={RouterLink} 
                to={`/post/${notif.post.id}`} 
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
                      : ` upvoted your post "${notif.post.title}".`}
                  </Text>
                </Flex>
              </ChakraLink>
          )}
        ))}
      </VStack>
    </Box>
  );
};

export default NotificationPanel;