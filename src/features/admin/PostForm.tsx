import { useState, useEffect } from 'react';
import { createPost, updatePost } from '../../api/admin.api';
import toast from 'react-hot-toast';

interface Props {
  post?: any; 
  onSuccess: () => void;
}

const PostForm = ({ post, onSuccess }: Props) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when post changes (important for Modal reuse)
  useEffect(() => {
    setTitle(post?.title || '');
    setContent(post?.content || '');
    setFile(null);
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      if (post) await updatePost(post.id, formData);
      else await createPost(formData);

      toast.success(post ? 'Article updated' : 'Article published!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
        <input
          type="text"
          placeholder="e.g. The Future of React 19"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg font-medium"
          required
        />
      </div>

      {/* Content Textarea */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Content (Markdown supported)</label>
        <textarea
          placeholder="Write your masterpiece here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[300px] resize-y"
          required
        />
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image or PDF</label>
        <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-indigo-400 transition-colors bg-gray-50/50">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="application/pdf,image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <span className="text-2xl mb-2 block">📁</span>
            <p className="text-sm text-gray-500">
              {file ? (
                <span className="text-indigo-600 font-bold">{file.name}</span>
              ) : (
                <>
                  <span className="font-bold text-indigo-600">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF (MAX. 10MB)</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </div>
          ) : (
            post ? 'Update Article' : 'Publish Article'
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;