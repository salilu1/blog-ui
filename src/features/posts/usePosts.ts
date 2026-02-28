import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../../api/posts.api';

export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await getPosts();
      return res.data;
    },
  });