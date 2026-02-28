import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostById } from '../../api/posts.api';
import { toggleLike } from '../../api/likes.api';
import { createComment } from '../../api/comments.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CommentItem from '../comments/CommentItem';
import CommentForm from '../comments/CommentForm';

// --- Shared Interfaces ---
export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  author?: User;
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: User;
  likes: { userId: string }[];
  comments: Comment[];
}

const COMMENTS_PER_PAGE = 6;

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [commentContent, setCommentContent] = useState('');

  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await getPostById(id!);
      return res.data; // Unwrapping Axios response
    },
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['post', id] }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(post!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentContent('');
      toast.success('Comment posted!');
    },
  });

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (isError || !post) return <div className="text-center mt-10">Post not found</div>;

  const likedByUser = post.likes.some((like) => like.userId === user?.id);
  const rootComments = post.comments.filter((c) => !c.parentId);
  const paginatedComments = rootComments.slice(0, page * COMMENTS_PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm mt-10 rounded-xl border">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-6 text-sm">
        By {post.author?.firstName} • {format(new Date(post.createdAt), 'PPP')}
      </p>

      <div className="prose mb-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      <button
        onClick={() => (user ? likeMutation.mutate() : toast.error('Please login'))}
        className={`flex items-center gap-2 text-lg mb-8 transition-all ${
          likedByUser ? 'text-red-500 scale-105' : 'text-gray-400'
        }`}
      >
        <span>{likedByUser ? '❤️' : '🤍'}</span>
        <span>{post.likes.length}</span>
      </button>

      <hr className="mb-8 border-gray-100" />

      <section>
        <h2 className="text-xl font-bold mb-6">Comments</h2>
        
        {user ? (
          <div className="mb-10">
            <CommentForm
              content={commentContent}
              setContent={setCommentContent}
              isLoading={commentMutation.isPending}
              onSubmit={() => commentMutation.mutate(commentContent)}
            />
          </div>
        ) : (
          <p className="mb-8 text-sm text-gray-400 italic">Login to leave a comment.</p>
        )}

        <div className="space-y-6">
          {paginatedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={post.id} />
          ))}
        </div>

        {paginatedComments.length < rootComments.length && (
          <button
            className="mt-8 w-full py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
            onClick={() => setPage((p) => p + 1)}
          >
            Load more comments
          </button>
        )}
      </section>
    </div>
  );
};

export default PostDetail;