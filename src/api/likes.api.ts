import { api } from './axios';

export const toggleLike = (postId: string) =>
  api.post(`/posts/${postId}/like`);