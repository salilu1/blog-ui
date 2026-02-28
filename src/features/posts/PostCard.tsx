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

  const handleLike = async () => {
    if (!user) {
      toast.error('Login first');
      return;
    }
    setLoading(true);
    try {
      await toggleLike(post.id);
      queryClient.invalidateQueries({ queryKey: ['posts'] }); // ✅ TS fix
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMore = () => navigate(`/posts/${post.id}`);

  const contentPreview =
    post.content.length > 100
      ? post.content.substring(0, 100) + '...'
      : post.content;

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{contentPreview}</p>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
        <span>
          {post.author?.firstName} • {format(new Date(post.createdAt), 'PPP')}
        </span>
        <button
          onClick={handleLike}
          disabled={loading}
          className={`font-semibold ${
            likedByUser ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          ❤️ {post.likes.length}
        </button>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{post.comments.length} comments</span>
        {post.content.length > 100 && (
          <button
            onClick={handleSeeMore}
            className="text-blue-600 hover:underline"
          >
            See more
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;