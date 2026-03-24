import { useState } from 'react';
import { useAuthStore } from '../../features/auth/authStore';
import { useComments, type Comment } from './useComments';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
}

const REPLIES_PER_PAGE = 3;

const CommentItem = ({ comment, postId, level = 0 }: CommentItemProps) => {
  const user = useAuthStore((state) => state.user);
  const { addComment, likeComment } = useComments(postId);
  const queryClient = useQueryClient();

  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyPage, setReplyPage] = useState(1);
  const [showReplies, setShowReplies] = useState(true);

  const likedByUser =
    comment.likes?.some((l) => l.userId === user?.id) ?? false;

  /** =========================
   * REPLY (OPTIMISTIC FIXED ✅)
   ========================== */
  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    if (!user) {
      toast.error('Login first');
      return;
    }

    const queryKey = ['comments', postId];

    // ✅ get previous cache
    const previous =
      queryClient.getQueryData<Comment[]>(queryKey) || [];

    // ✅ optimistic reply
    const tempReply: Comment = {
      id: 'temp-' + Math.random(),
      content: replyContent,
      postId,
      parentId: comment.id,
      author: { id: user.id, firstName: user.firstName },
      likes: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const attachReply = (comments: Comment[]): Comment[] =>
      comments.map((c) => {
        if (c.id === comment.id) {
          return {
            ...c,
            replies: [...(c.replies || []), tempReply],
          };
        }

        if (c.replies?.length) {
          return {
            ...c,
            replies: attachReply(c.replies),
          };
        }

        return c;
      });

    // ✅ update cache immediately
    queryClient.setQueryData<Comment[]>(queryKey, attachReply(previous));

    // ✅ reset UI immediately
    setReplyContent('');
    setReplying(false);
    setShowReplies(true);

    // ✅ send request
    addComment.mutate(
      { content: tempReply.content, parentId: comment.id },
      {
        onError: () => {
          // rollback
          queryClient.setQueryData(queryKey, previous);
          toast.error('Failed to post reply');
        },
        onSettled: () => {
          // sync with server
          queryClient.invalidateQueries({ queryKey });
        },
      }
    );
  };

  /** =========================
   * LIKE
   ========================== */
  const handleLike = () => {
    if (!user) {
      toast.error('Login first');
      return;
    }
    likeComment.mutate(comment.id);
  };

  const paginatedReplies =
    comment.replies?.slice(0, replyPage * REPLIES_PER_PAGE) || [];

  return (
    <div
      className={`mb-4 ${
        level > 0 ? 'ml-6 border-l pl-4 border-gray-200' : ''
      }`}
    >
      {/* HEADER */}
      <div className="text-sm text-gray-700">
        <span className="font-semibold">
          {comment.author?.firstName ?? 'Unknown'}
        </span>{' '}
        <span className="text-gray-400 text-xs">
          • {format(new Date(comment.createdAt), 'PPP')}
        </span>
      </div>

      {/* CONTENT */}
      <p className="text-gray-800 mt-1">{comment.content}</p>

      {/* ACTIONS */}
      <div className="flex gap-4 items-center text-sm mt-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition ${
            likedByUser
              ? 'text-red-500 scale-105'
              : 'text-gray-400'
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

        {comment.replies?.length ? (
          <button
            className="text-xs text-gray-500 hover:underline"
            onClick={() => setShowReplies((prev) => !prev)}
          >
            {showReplies
              ? `Hide replies (${comment.replies.length})`
              : `Show replies (${comment.replies.length})`}
          </button>
        ) : null}
      </div>

      {/* REPLY INPUT */}
      {replying && (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Write a reply..."
            className="flex-1 p-2 border rounded"
            value={replyContent}
            onChange={(e) =>
              setReplyContent(e.target.value)
            }
          />
          <button
            className="bg-blue-600 text-white px-3 rounded"
            onClick={handleReply}
          >
            Post
          </button>
        </div>
      )}

      {/* REPLIES */}
      {showReplies && paginatedReplies.length ? (
        <div className="mt-2 space-y-2">
          {paginatedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              level={level + 1}
            />
          ))}

          {paginatedReplies.length < comment.replies.length && (
            <button
              className="text-xs text-gray-500 hover:underline mt-2"
              onClick={() =>
                setReplyPage((prev) => prev + 1)
              }
            >
              Load more replies (
              {comment.replies.length - paginatedReplies.length})
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CommentItem;