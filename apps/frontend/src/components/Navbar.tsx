// components/Navbar.tsx

import {
  Flex,
  Box,
  Input,
  InputGroup,
  Menu,
  Text,
  Image,
  Button,
  Portal,
  IconButton
} from "@chakra-ui/react";
import { BiSearchAlt2 } from "react-icons/bi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogoClick = () => {
    navigate("/feed");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings"); // Changed from "/change-password" to "/settings"
  };

  return (
    <Flex
      as="nav"
      bg="white"
      boxShadow="sm"
      p={4}
      align="center"
      justify="space-between"
      position="sticky"
    //   top={-1}
      zIndex={10}
      minH="60px" // Added minimum height for consistency
    >
      {/* Logo */}
      <Box 
        onClick={handleLogoClick} 
        cursor="pointer"
        _hover={{ opacity: 0.8 }} // Added hover effect
        transition="opacity 0.2s"
      >
        <Text fontSize="xl" fontWeight="bold" color="teal.500">
          MyApp
        </Text>
      </Box>

      {/* Search bar */}
      <InputGroup maxW="400px" flex="1" mx={6} startElement={<BiSearchAlt2/>}> 
        <Input 
          type="text" 
          placeholder="Search posts..." 
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          _hover={{ borderColor: "gray.300" }}
        />
      </InputGroup>

      <Menu.Root>
        <Menu.Trigger asChild>
            <IconButton variant={'ghost'}>
                <Image src={user?.avatar} boxSize="50px"
                    borderRadius="full"
                    fit="cover"/>
            </IconButton>
        </Menu.Trigger>
        <Portal>
            <Menu.Positioner>
                <Menu.Content>
                    <Menu.Item value="profile" onClick={() => handleProfileClick()}>
                        Profile
                    </Menu.Item>
                    <Menu.Item value="settings" onClick={() => handleSettingsClick()}>
                        Settings
                    </Menu.Item>
                    <Menu.Item value="logout" color="fg.error"
                _hover={{ bg: "bg.error", color: "fg.error" }} onClick={() => handleLogout()}>
                        Logout
                    </Menu.Item>
                </Menu.Content>
            </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>

  );
};

export default Navbar;