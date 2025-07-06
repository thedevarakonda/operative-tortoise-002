import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  IconButton,
  Flex
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Box maxW="xl" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="lg">
      {/* Back Button and Title in Same Line */}
      <Flex align="center" mb={6}>
        <IconButton
          variant="ghost"
          onClick={() => navigate('/feed')}
          aria-label="Back to Feed"
          mr={3}
        >
          <BiArrowBack />
        </IconButton>
        <Heading size="lg" color="teal.600">
          Account Settings
        </Heading>
      </Flex>

      <Stack >
        {/* Profile Info Section (dummy) */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <Heading size="sm" mb={2}>Profile Info</Heading>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Update your name, email, or avatar.
          </Text>
          <Button variant="outline" disabled>
            Edit Profile Info (Coming Soon)
          </Button>
        </Box>

        {/* Change Password */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <Heading size="sm" mb={2}>Security</Heading>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Manage your password and secure your account.
          </Text>
          <Button colorScheme="teal" onClick={() => navigate("/change-password")}>
            Change Password
          </Button>
        </Box>

        {/* Notifications Section (dummy) */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <Heading size="sm" mb={2}>Notifications</Heading>
          <Text fontSize="sm" color="gray.600" mb={1}>Email Notifications: Disabled</Text>
          <Text fontSize="sm" color="gray.600">In-App Notifications: Disabled</Text>
        </Box>

        {/* Theme Preferences (dummy) */}
        <Box p={4} border="1px solid" borderColor="gray.200" rounded="md">
          <Heading size="sm" mb={2}>Appearance</Heading>
          <Text fontSize="sm" color="gray.600">Theme: Light (Dark mode coming soon)</Text>
        </Box>

        {/* Danger Zone */}
        <Box p={4} border="1px solid" borderColor="red.200" rounded="md" bg="red.50">
          <Heading size="sm" color="red.500" mb={2}>Danger Zone</Heading>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Deleting your account is irreversible. All data will be lost.
          </Text>
          <Button variant="outline" colorScheme="red" disabled>
            Delete Account (Coming Soon)
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Settings;