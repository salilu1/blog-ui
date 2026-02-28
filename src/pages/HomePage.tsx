import PostCard from '../features/posts/PostCard';
import { usePosts } from '../features/posts/usePosts';

const Home = () => {
  const { data: posts, isLoading } = usePosts();

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6">
        {posts?.length === 0 && <p>No posts yet.</p>}

        {posts?.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;