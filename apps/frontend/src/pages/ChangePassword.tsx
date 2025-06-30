import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Stack
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toaster } from "../components/ui/toaster";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toaster.create({
        title: "All fields are required",
        type: "error",
        closable: true,
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3001/api/profile/${user?.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toaster.create({
          title: data.error || "Failed to update password",
          type: "error",
          closable: true,
          duration: 2000,
        });
        return;
      }

      toaster.create({
        title: "Password updated successfully",
        type: "success",
        closable: true,
        duration: 2000,
      });

      navigate(`/profile/${user?.username}`);

    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Something went wrong",
        type: "error",
        closable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} bg="white" rounded="md" shadow="md">
      <Heading size="md" mb={4}>Change Password</Heading>
      <Stack spaceX={4}>
        <Input
          placeholder="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          colorScheme="teal"
          onClick={handleChangePassword}
          loading={isSubmitting}
        >
          Update Password
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/profile/${user?.username}`)}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

export default ChangePassword;
