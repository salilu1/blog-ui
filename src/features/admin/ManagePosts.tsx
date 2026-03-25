import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPosts, deletePost } from '../../api/admin.api';
import PostForm from './PostForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ManagePosts = () => {
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: getAdminPosts,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Post deleted successfully');
    },
    onError: () => toast.error('Failed to delete post')
  });

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading posts...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-500 text-sm mt-1">Total posts: {posts?.data?.length || 0}</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 text-sm"
        >
          <span className="text-xl leading-none">+</span> New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title & Preview</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts?.data?.map((post: any) => (
                <tr key={post.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.content.slice(0, 80)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(post)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Edit</button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Delete this post?')) deleteMutation.mutate(post.id)
                        }} 
                        className="text-red-400 hover:text-red-600 font-bold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingPost ? 'Update Post' : 'Create New Post'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <PostForm
                post={editingPost}
                onSuccess={() => {
                  setIsModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePosts;