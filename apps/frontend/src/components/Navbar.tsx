// components/Navbar.tsx

import {
  Flex,
  Box,
  Input,
  Menu,
  Text,
  Image,
  Button,
  Portal,
  IconButton,
  Spinner,
  Circle, // ✨ NEW
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toaster } from "./ui/toaster";
import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications"; // ✨ NEW
// import NotificationPanel from "./NotificationPanel"; // ✨ NEW
import { BiSolidBell } from "react-icons/bi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ✨ NEW: Notification state and logic
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleBellClick = () => {
    // When opening the panel, mark notifications as read if there are any
    if (!isPanelOpen && unreadCount > 0) {
      markAsRead();
    }
    setIsPanelOpen(!isPanelOpen);
  };
  // ✨ END NEW

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setIsLoggingOut(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await logout();
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toaster.create({
        title: "Logout failed",
        type: "error",
        duration: 3000,
        closable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/feed");
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user?.username}`, {
      state: { userId: user?.id },
    });
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/user/${searchTerm}`);
      if (!res.ok) {
        throw new Error("User not found");
      }
      const data = await res.json();
      navigate(`/profile/${searchTerm}`,{ state: { userId: data.id } });
    } catch (err) {
      toaster.create({
        title: "User not found",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  return (
    <>
      {isLoggingOut && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="rgba(255, 255, 255, 0.6)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="teal.500" />
        </Box>
      )}
      <Flex
        as="nav"
        bg="white"
        boxShadow="sm"
        p={4}
        align="center"
        justify="space-between"
        position="sticky"
        zIndex={10}
        minH="60px"
      >
        {/* Logo */}
        <Box
          onClick={handleLogoClick}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <Text fontSize="xl" fontWeight="bold" color="teal.500">
            MyApp
          </Text>
        </Box>

        {/* Search bar */}
        <Flex maxW="400px" flex="1" mx={6}>
          <Input
            placeholder="Search for people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mr={2}
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </Flex>

        {/* ✨ NEW: Notification Bell and Profile Menu Wrapper */}
        <Flex align="center">
          {user && (
            <Box position="relative" mr={4}>
              <IconButton
                aria-label="Notifications"
                variant="ghost"
                fontSize="24px"
                onClick={handleBellClick}
              >
                <BiSolidBell />
              </IconButton>
              {unreadCount > 0 && (
                <Circle
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  bg="red.500"
                  color="white"
                  size="20px"
                  fontSize="xs"
                >
                  {unreadCount}
                </Circle>
              )}
              {/* {isPanelOpen && <NotificationPanel notifications={notifications} />} */}
            </Box>
          )}

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
                        <Menu.Item
                          value="logout"
                          color="fg.error"
                          _hover={{ bg: "bg.error", color: "fg.error" }}
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <Flex align="center">
                              <Spinner size="xs" mr={2} /> Logging out...
                            </Flex>
                          ) : (
                            "Logout"
                          )}
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
        {/* ✨ END NEW */}
      </Flex>
    </>
  );
};

export default Navbar;