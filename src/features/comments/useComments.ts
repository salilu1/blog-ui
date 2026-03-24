import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommentsByPost,
  createComment as createCommentApi,
  toggleLikeComment,
} from '../../api/comments.api';
import { useAuthStore } from '../auth/authStore';
import type { AxiosResponse } from 'axios';

/** =========================
 * TYPES
 ========================== */
export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  authorId?: string;
  author?: {
    id: string;
    firstName: string;
  };
  likes?: { userId: string }[];
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

interface AddCommentParams {
  content: string;
  parentId?: string;
}

/** =========================
 * HELPER: Build nested comment tree
 ========================== */
const buildCommentTree = (comments: Comment[]): Comment[] => {
  const map: Record<string, Comment> = {};
  const roots: Comment[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    if (c.parentId) {
      const parent = map[c.parentId];
      if (parent) parent.replies!.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
};

/** =========================
 * HOOK
 ========================== */
export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Fetch all comments and build nested structure
  const commentsQuery = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await getCommentsByPost(postId);
      return buildCommentTree(res.data);
    },
    enabled: !!postId,
  });

  // Add comment or reply
  const addComment = useMutation<AxiosResponse, Error, AddCommentParams>({
    mutationFn: ({ content, parentId }) =>
      createCommentApi(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  // Like/unlike comment (optimistic update)
  const likeComment = useMutation<
    AxiosResponse,
    Error,
    string,
    { previous?: Comment[] }
  >({
    mutationFn: (commentId) => toggleLikeComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previous = queryClient.getQueryData<Comment[]>(['comments', postId]);

      queryClient.setQueryData<Comment[]>(['comments', postId], (old) => {
        if (!old) return old;

        const updateLikes = (comments: Comment[]): Comment[] =>
          comments.map((c) => {
            if (c.id === commentId) {
              const liked = c.likes?.some((l) => l.userId === user?.id);
              return {
                ...c,
                likes: liked
                  ? (c.likes || []).filter((l) => l.userId !== user?.id)
                  : [...(c.likes || []), { userId: user?.id! }],
              };
            }

            if (c.replies?.length) {
              return { ...c, replies: updateLikes(c.replies) };
            }
            return c;
          });

        return updateLikes(old);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments', postId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    addComment,
    likeComment,
  };
};