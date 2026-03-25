import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostById } from '../../api/posts.api';
import { toggleLike } from '../../api/likes.api';
import { createComment } from '../../api/comments.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CommentItem from '../comments/CommentItem';
import CommentForm from '../comments/CommentForm';
import type { Comment as CommentType } from '../comments/useComments';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: User;
  likes: { userId: string }[];
  comments: CommentType[];
}

const COMMENTS_PER_PAGE = 6;

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [commentContent, setCommentContent] = useState('');

  // --- Fetch post
  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await getPostById(id!);
      return res.data;
    },
    enabled: !!id,
  });

  // --- Tree Building Logic
  const nestedComments = useMemo<CommentType[]>(() => {
    if (!post?.comments) return [];
    const map = new Map<string, CommentType>();
    const roots: CommentType[] = [];

    post.comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));

    post.comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [post?.comments]);

  const paginatedComments = nestedComments.slice(0, page * COMMENTS_PER_PAGE);

  /** =========================
   * OPTIMISTIC POST LIKE
   ========================== */
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post!.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', id] });
      const previousPost = queryClient.getQueryData<Post>(['post', id]);

      if (previousPost) {
        queryClient.setQueryData(['post', id], {
          ...previousPost,
          likes: previousPost.likes.some(l => l.userId === user?.id)
            ? previousPost.likes.filter(l => l.userId !== user?.id)
            : [...previousPost.likes, { userId: user?.id }],
        });
      }
      return { previousPost };
    },
    onError: (_, __, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', id], context.previousPost);
      }
      toast.error("Couldn't update like");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(post!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentContent('');
      toast.success('Comment posted!');
    },
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto mt-20 space-y-4 px-6">
      <div className="h-10 bg-gray-100 rounded-md w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded-md w-1/4 animate-pulse" />
      <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
    </div>
  );
  
  if (isError || !post) return <div className="text-center mt-20 font-medium">Post not found</div>;

  const likedByUser = post.likes.some((like) => like.userId === user?.id);

  return (
    <div className="min-h-screen bg-white  pb-20">
      {/* Top Navigation Bar / Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-50 mb-8">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-medium"
          >
            ← Back to Feed
          </button>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {post.author?.firstName?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(post.createdAt), 'MMMM d, yyyy')} • 5 min read
                </p>
              </div>
            </div>

            {/* Post Level Interactions */}
            <div className="flex items-center gap-2">
               <button
                onClick={() => (user ? likeMutation.mutate() : toast.error('Please login'))}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  likedByUser 
                    ? 'bg-red-50 border-red-100 text-red-500' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                <span className={`transition-transform ${likedByUser ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {likedByUser ? '❤️' : '🤍'}
                </span>
                <span className="text-sm font-bold">{post.likes.length}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-[1.8] text-lg mb-16 whitespace-pre-wrap font-serif">
          {post.content}
        </div>

        <hr className="border-gray-100 mb-12" />

        {/* Comments Section */}
        <section id="comments" className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Community <span className="text-gray-400 font-normal ml-1">({post.comments.length})</span>
            </h2>
          </div>

          {user ? (
            <div className="mb-12 bg-gray-50 p-4 rounded-2xl">
              <CommentForm
                content={commentContent}
                setContent={setCommentContent}
                isLoading={commentMutation.isPending}
                onSubmit={() => {
                  if (!commentContent.trim()) return;
                  commentMutation.mutate(commentContent);
                }}
              />
            </div>
          ) : (
            <div className="mb-12 p-6 bg-blue-50 rounded-2xl text-center">
              <p className="text-blue-700 text-sm font-medium">
                Want to join the discussion? <button onClick={() => navigate('/login')} className="underline font-bold">Log in</button>
              </p>
            </div>
          )}

          <div className="space-y-8">
            {paginatedComments.length > 0 ? (
              paginatedComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          {paginatedComments.length < nestedComments.length && (
            <button
              className="mt-12 w-full py-4 text-sm font-bold text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Show more comments
            </button>
          )}
        </section>
      </article>
    </div>
  );
};

export default PostDetail;