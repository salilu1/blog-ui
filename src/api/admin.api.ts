import { api } from "./axios";

export const getAdminPosts = () => api.get("/posts");

export const createPost = (data: FormData) =>
  api.post("/posts", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePost = (id: string, data: FormData) =>
  api.patch(`/posts/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePost = (id: string) => api.delete(`/posts/${id}`);