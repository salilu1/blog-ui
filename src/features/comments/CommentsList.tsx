import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommentsByPost, createComment as createCommentApi, toggleLikeComment } from '../../api/comments.api';
import type { AxiosResponse } from 'axios';

export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author?: { id: string; firstName: string; };
  replies?: Comment[];
}

interface AddCommentParams {
  content: string;
  parentId?: string;
}

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await getCommentsByPost(postId);
      return res.data; 
    },
    enabled: !!postId,
  });

  const addComment = useMutation<AxiosResponse, Error, AddCommentParams>({
    mutationFn: ({ content, parentId }) => createCommentApi(postId, content, parentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const likeComment = useMutation<AxiosResponse, Error, string>({
    mutationFn: (commentId) => toggleLikeComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  return { commentsQuery, addComment, likeComment };
};