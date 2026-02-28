// frontend: posts.api.ts
import { api } from './axios';

export const getPosts = () => api.get('/posts'); // calls NestJS
export const likePost = (postId: string) => api.post(`/likes/${postId}`);