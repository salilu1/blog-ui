import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommentsByPost,
  createComment as createCommentApi,
  toggleLikeComment,
} from '../../api/comments.api';
import type { AxiosResponse } from 'axios';

interface AddCommentParams {
  content: string;
  parentId?: string;
}

// Optional: Define a Comment interface to make your data typesafe
interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
  };
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  // 1. Fixed useQuery: Using the Object syntax
  const commentsQuery = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await getCommentsByPost(postId);
      return res.data; // Unwrapping the Axios response here
    },
    enabled: !!postId,
  });

  // 2. Fixed addComment mutation: Using the Object syntax
  const addComment = useMutation<AxiosResponse, Error, AddCommentParams>({
    mutationFn: ({ content, parentId }) => 
      createCommentApi(postId, content, parentId),
    onSuccess: () => {
      // Invalidate the comments list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  // 3. Fixed likeComment mutation: Using the Object syntax
  const likeComment = useMutation<AxiosResponse, Error, string>({
    mutationFn: (commentId: string) => toggleLikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return { 
    commentsQuery, 
    addComment, 
    likeComment 
  };
};