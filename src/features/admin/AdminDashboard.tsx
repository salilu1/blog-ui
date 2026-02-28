import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminPosts, deletePost } from '../../api/admin.api';
import PostForm from './PostForm';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../routes/ProtectedRoute';

const AdminDashboard = () => {
  const { data: posts, refetch } = useQuery({
    queryKey: ['adminPosts'],   // ✅ must be inside options object
    queryFn: getAdminPosts,     // ✅ required
  });

  const [editingPost, setEditingPost] = useState<any>(null);

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <div className="mb-6">
          <PostForm
            post={editingPost}
            onSuccess={() => {
              setEditingPost(null);
              refetch();
            }}
          />
        </div>

        <div className="space-y-4">
          {posts?.data?.map((post: any) => (
            <div key={post.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <h2 className="font-bold">{post.title}</h2>
                <p className="text-sm text-gray-500">{post.content.slice(0, 100)}...</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 px-3 py-1 rounded text-white"
                  onClick={() => setEditingPost(post)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 px-3 py-1 rounded text-white"
                  onClick={async () => {
                    await deletePost(post.id);
                    toast.success('Post deleted');
                    refetch();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;