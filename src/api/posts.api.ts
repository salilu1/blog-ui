// src/api/posts.api.ts
import {api} from './axios';

// Fetch all posts
export const getPosts = () => api.get('/posts');

// ✅ Fetch single post by ID
export const getPostById = (postId: string) => api.get(`/posts/${postId}`);