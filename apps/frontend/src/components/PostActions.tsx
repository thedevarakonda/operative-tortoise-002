import React from 'react';
import {
  IconButton,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { BiSolidUpvote, BiComment, BiEdit, BiTrash } from "react-icons/bi";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useUpvote } from "../hooks/useUpvote";

interface PostActionsProps {
  post: {
    id: number;
    upvotes: number;
    author?: {
      username: string;
    };
    commentCount?: number;
  };
  // Action configurations
  showUpvote?: boolean;
  showComment?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  
  // Event handlers
  onUpvoteUpdate?: (newUpvotes: number) => void;
  onCommentClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  
  // Optional styling
  size?: "xs" | "sm" | "md" | "lg";
  spacing?: number;
  direction?: "row" | "column";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  
  // Prevent event bubbling (useful when actions are inside clickable containers)
  stopPropagation?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  showUpvote = true,
  showComment = false,
  showEdit = true,
  showDelete = true,
  onUpvoteUpdate,
  onCommentClick,
  onEditClick,
  onDeleteClick,
  size = "xs",
  spacing = 2,
  direction = "row",
  justify = "flex-start",
  stopPropagation = true,
}) => {
  const { user } = useAuth();
  const { hasUpvoted, toggleUpvote } = useUpvote();

  const handleClick = (callback?: () => void) => (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    callback?.();
  };

  const handleUpvote = handleClick(() => {
    toggleUpvote(post.id, post.upvotes, (newUpvotes) => {
      onUpvoteUpdate?.(newUpvotes);
    });
  });

  const isOwner = post.author?.username === user?.username;

  return (
    <Flex
      direction={direction}
      align="center"
      justify="space-between"
      gap={spacing}
      w="100%"
    >
      {/* Left Actions (Upvote & Comment) */}
      <Flex align="center" gap={spacing}>
        {showUpvote && (
          <Flex align="center" gap={1}>
            <motion.div
              whileTap={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <IconButton
                size={size}
                aria-label="Upvote"
                variant={hasUpvoted(post.id) ? 'solid' : 'outline'}
                onClick={handleUpvote}
              >
                <BiSolidUpvote />
              </IconButton>
            </motion.div>
            <Badge size="sm" variant="plain">
              {post.upvotes}
            </Badge>
          </Flex>
        )}

        {showComment && (
          <Flex align="center" gap={1}>
            <IconButton
              size={size}
              variant="ghost"
              aria-label="Comment"
              onClick={handleClick(onCommentClick)}
            >
              <BiComment />
            </IconButton>
            <Badge size="sm" variant="plain">
              {post.commentCount ?? 0}
            </Badge>
          </Flex>
        )}
      </Flex>

      {/* Right Actions (Edit/Delete) */}
      {isOwner && (
        <Flex align="center" gap={1}>
          {showEdit && (
            <IconButton
              size={size}
              aria-label="Edit"
              variant="ghost"
              color="blue.500"
              onClick={handleClick(onEditClick)}
            >
              <BiEdit />
            </IconButton>
          )}

          {showDelete && (
            <IconButton
              size={size}
              aria-label="Delete"
              variant="ghost"
              color="red.500"
              onClick={handleClick(onDeleteClick)}
            >
              <BiTrash />
            </IconButton>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default PostActions;