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
  replies: Comment[];
}

interface AddCommentParams {
  content: string;
  parentId?: string;
}

/** =========================
 * HOOK
 ========================== */
export const useComments = (postId: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  /** =========================
   * CREATE COMMENT / REPLY
   ========================== */
  const addComment = useMutation<AxiosResponse, Error, AddCommentParams>({
    mutationFn: ({ content, parentId }) =>
      createCommentApi(postId, content, parentId),

    onSuccess: () => {
      // Invalidate the post query so the new comment appears
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  /** =========================
   * LIKE COMMENT (OPTIMISTIC 🔥)
   ========================== */
  const likeComment = useMutation<
    AxiosResponse,
    Error,
    string,
    { previousPost?: any }
  >({
    mutationFn: (commentId) => toggleLikeComment(commentId),

    onMutate: async (commentId) => {
      const queryKey = ['post', postId];

      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the previous value
      const previousPost = queryClient.getQueryData<any>(queryKey);

      // 3. Optimistically update the 'post' cache
      if (previousPost) {
        queryClient.setQueryData<any>(queryKey, (old: { comments: any[]; }) => {
          if (!old || !old.comments) return old;

          // We update the FLAT comments array inside the post object.
          // PostDetail's useMemo will automatically rebuild the tree with the new like.
          const updatedComments = old.comments.map((c: any) => {
            if (c.id === commentId) {
              const currentLikes = c.likes ?? [];
              const alreadyLiked = currentLikes.some((l: any) => l.userId === user?.id);

              return {
                ...c,
                likes: alreadyLiked
                  ? currentLikes.filter((l: any) => l.userId !== user?.id)
                  : [...currentLikes, { userId: user?.id }],
              };
            }
            return c;
          });

          return { ...old, comments: updatedComments };
        });
      }

      return { previousPost };
    },

    // 4. If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },

    // 5. Always refetch after error or success to keep server in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  return {
    addComment,
    likeComment,
  };
};