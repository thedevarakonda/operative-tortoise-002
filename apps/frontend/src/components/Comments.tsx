import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Stack,
  Text,
  Textarea
} from "@chakra-ui/react";
import { BiPlus } from "react-icons/bi";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toaster } from "./ui/toaster";

type User = {
  id: string;
  username: string;
  avatar: string;
};

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface CommentsProps {
  postId: number;
  user: User | null;
  initialComments?: Comment[];
}

const Comments = ({ postId, user, initialComments = [] }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/post/${postId}/comments`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      return toaster.create({
        title: "Error",
        description: "Comment cannot be empty",
        type: "error",
        duration: 3000,
      });
    }

    if (!user?.id) {
      return toaster.create({
        title: "Error",
        description: "You must be logged in to comment",
        type: "error",
        duration: 3000,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/post/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), authorId: user.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }

      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setContent("");
      setShowForm(false);

      toaster.create({
        title: "Success",
        description: "Comment added successfully",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit",
        type: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box mt={6}>
      <Flex align="center" justify="space-between" mb={3}>
        <Heading size="sm">Comments</Heading>
        {user && (
          <IconButton
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
            disabled={showForm}
            aria-label="Add comment"
          >
            <BiPlus />
        </IconButton>
        )}
      </Flex>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box mb={4} p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment here..."
              resize="vertical"
              minH="100px"
              mb={3}
              bg="white"
            />
            <Flex gap={2}>
              <Button
                size="sm"
                colorScheme="teal"
                onClick={handleSubmit}
                loading={submitting}
                loadingText="Submitting..."
              >
                Submit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setContent("");
                  setShowForm(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Flex>
          </Box>
        </motion.div>
      )}

      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <Text color="gray.500">No comments yet.</Text>
      ) : (
        <Stack spaceX={4}>
          {comments.map(comment => (
            <Box key={comment.id} p={3} bg="gray.50" borderRadius="md" shadow="sm">
              <Text fontSize="sm" mb={1}>"{comment.content}"</Text>
              <Flex justify="space-between" fontSize="xs" color="gray.500">
                <Text>by {comment.author.username}</Text>
                <Text>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</Text>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Comments;
