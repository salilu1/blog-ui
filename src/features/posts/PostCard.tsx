import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { toggleLike } from '../../api/likes.api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface PostCardProps {
  post: any;
}

const PostCard = ({ post }: PostCardProps) => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const likedByUser = post.likes.some((like: any) => like.userId === user?.id);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to detail if inside a clickable container
    if (!user) {
      toast.error('Login first');
      return;
    }
    setLoading(true);
    try {
      await toggleLike(post.id);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => navigate(`/posts/${post.id}`);

  // Preview logic
  const contentPreview = post.content.length > 160 
    ? post.content.substring(0, 160) + "..." 
    : post.content;

  return (
    <div 
      onClick={handleNavigate}
      className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer mb-6"
    >
      {/* Category or Tag (Optional Placeholder) */}
      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 block">
        Article
      </span>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h2>

      {/* Content Preview */}
      <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
        {contentPreview}
      </p>

      {/* Divider */}
      <div className="h-px w-full bg-gray-50 mb-5" />

      {/* Footer Meta */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Avatar Placeholder */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {post.author?.firstName?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 leading-none mb-1">
              {post.author?.firstName} {post.author?.lastName}
            </span>
            <span className="text-xs text-gray-400">
              {format(new Date(post.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Comment Count - Now Leads to PostDetail */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors group/btn"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-blue-50">
              <span className="text-lg">💬</span>
            </div>
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 transition-all group/like ${
              likedByUser ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <div className={`p-2 rounded-full ${likedByUser ? 'bg-red-50' : 'group-hover/like:bg-red-50'}`}>
              <span className={`text-lg transition-transform ${likedByUser ? 'scale-110' : 'group-hover:scale-110'}`}>
                {likedByUser ? '❤️' : '🤍'}
              </span>
            </div>
            <span className="text-sm font-medium">{post.likes.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;