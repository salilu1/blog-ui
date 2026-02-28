import { useState } from 'react';
import { useAuthStore } from '../../features/auth/authStore';
import { useComments } from './useComments';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: any;
  postId: string;
  level?: number;
}

const CommentItem = ({ comment, postId, level = 0 }: CommentItemProps) => {
  const user = useAuthStore((state) => state.user);
  const { addComment, likeComment } = useComments(postId);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const likedByUser = comment.likes.some((like: any) => like.userId === user?.id);

  const handleReply = () => {
    if (!replyContent.trim()) return toast.error('Reply cannot be empty');

    addComment.mutate({ content: replyContent, parentId: comment.id });
    setReplyContent('');
    setReplying(false);
  };

  const handleLike = () => {
    if (!user) return toast.error('Login first');
    likeComment.mutate(comment.id);
  };

  return (
    <div className={`mb-3 ${level > 0 ? 'ml-6 border-l pl-4 border-gray-300' : ''}`}>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{comment.author?.firstName}</span>{' '}
        <span className="text-gray-400 text-xs">
          • {format(new Date(comment.createdAt), 'PPP')}
        </span>
      </div>
      <p className="text-gray-800 mt-1">{comment.content}</p>

      <div className="flex gap-4 items-center text-sm mt-1">
        <button
          className={`font-semibold ${likedByUser ? 'text-red-500' : 'text-gray-400'}`}
          onClick={handleLike}
        >
          ❤️ {comment.likes.length}
        </button>

        {user && (
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setReplying((prev) => !prev)}
          >
            {replying ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Write a reply..."
            className="flex-1 p-2 border rounded"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 transition"
            onClick={handleReply}
          >
            Post
          </button>
        </div>
      )}

      {/* Render nested replies recursively */}
      {comment.replies?.map((reply: any) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} level={level + 1} />
      ))}
    </div>
  );
};

export default CommentItem;