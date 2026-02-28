import type { Dispatch, SetStateAction } from 'react';

interface CommentFormProps {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const CommentForm = ({ 
  content, 
  setContent, 
  onSubmit, 
  isLoading = false, 
  placeholder = "Write a comment..." 
}: CommentFormProps) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2 w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        disabled={isLoading}
      />
      <button 
        type="submit" 
        disabled={isLoading || !content.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded font-medium disabled:bg-gray-400 hover:bg-blue-700 transition-colors min-w-[80px]"
      >
        {isLoading ? '...' : 'Post'}
      </button>
    </form>
  );
};

export default CommentForm;