import { api } from './axios';

// Ensure the name matches the hook import (getCommentsByPost)
export const getCommentsByPost = (postId: string) =>
  api.get(`/comments/${postId}`);

export const createComment = (postId: string, content: string, parentId?: string) =>
  api.post('/comments', { postId, content, parentId });

// Added missing toggle function
export const toggleLikeComment = (commentId: string) =>
  api.post(`/comments/${commentId}/like`);