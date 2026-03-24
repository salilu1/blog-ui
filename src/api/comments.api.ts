import { api } from './axios';

/** Get comments for a post */
export const getCommentsByPost = (postId: string) =>
  api.get(`/posts/${postId}/comments`); // ✅ FIXED

/** Create comment or reply */
export const createComment = (
  postId: string,
  content: string,
  parentId?: string
) =>
  api.post(`/posts/${postId}/comments`, {
    content,
    parentId,
  }); // ✅ FIXED

/** Toggle like/unlike on comment */
export const toggleLikeComment = (commentId: string) =>
  api.post(`/comments/${commentId}/like`); // ✅ already correct

/** Optional: unlike explicitly */
export const unlikeComment = (commentId: string) =>
  api.post(`/comments/${commentId}/unlike`);

/** Update comment */
export const updateComment = (id: string, content: string) =>
  api.patch(`/comments/${id}`, { content });

/** Delete comment */
export const deleteComment = (id: string) =>
  api.delete(`/comments/${id}`);