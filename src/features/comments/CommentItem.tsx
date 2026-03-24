import { useState } from 'react';
import { useAuthStore } from '../../features/auth/authStore';
import { useComments, type Comment } from './useComments';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
}

const CommentItem = ({ comment, postId, level = 0 }: CommentItemProps) => {
  const user = useAuthStore((state) => state.user);
  const { addComment, likeComment } = useComments(postId);

  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  // Safe check if user liked this comment
  const likedByUser = comment.likes?.some((like) => like.userId === user?.id) ?? false;

  const handleReply = () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    addComment.mutate(
      { content: replyContent, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent('');
          setReplying(false);
          setShowReplies(true); // automatically show replies after posting
        },
      }
    );
  };

  const handleLike = () => {
    if (!user) {
      toast.error('Login first');
      return;
    }
    likeComment.mutate(comment.id);
  };

  return (
    <div className={`mb-4 ${level > 0 ? 'ml-6 border-l pl-4 border-gray-200' : ''}`}>
      {/* Header */}
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{comment.author?.firstName ?? 'Unknown'}</span>{' '}
        <span className="text-gray-400 text-xs">• {format(new Date(comment.createdAt), 'PPP')}</span>
      </div>

      {/* Content */}
      <p className="text-gray-800 mt-1">{comment.content}</p>

      {/* Actions */}
      <div className="flex gap-4 items-center text-sm mt-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition ${
            likedByUser ? 'text-red-500 scale-105' : 'text-gray-400'
          }`}
        >
          <span>{likedByUser ? '❤️' : '🤍'}</span>
          {comment.likes?.length ?? 0}
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

      {/* Reply Input */}
      {replying && (
        <div className="mt-2 flex gap-2 animate-fade-in">
          <input
            autoFocus
            type="text"
            placeholder="Write a reply..."
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400"
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

      {/* Toggle Replies */}
      {comment.replies?.length ? (
        <button
          className="text-xs text-gray-500 hover:underline mt-2"
          onClick={() => setShowReplies((prev) => !prev)}
        >
          {showReplies
            ? `Hide replies (${comment.replies.length})`
            : `Show replies (${comment.replies.length})`}
        </button>
      ) : null}

      {/* Nested Replies */}
      {showReplies &&
        comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            postId={postId}
            level={level + 1}
          />
        ))}
    </div>
  );
};

export default CommentItem;