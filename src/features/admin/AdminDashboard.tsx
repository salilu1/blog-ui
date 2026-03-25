import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios'; // ✅ Using your custom axios instance
import ProtectedRoute from '../../routes/ProtectedRoute';

// Define types to match your NestJS Service return
interface StatSummary {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface TopPost {
  id: string;
  title: string;
  _count: {
    likes: number;
    comments: number;
  };
}

interface DashboardStats {
  summary: StatSummary[];
  topPosts: TopPost[];
}

const AdminDashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // ✅ No need for full URL or token logic here; your interceptor handles it!
      const res = await api.get('/admin/stats'); 
      return res.data;
    },
    retry: 1, // Attempt one retry if the first request fails
  });

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="p-10 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  // Error State with Retry Button
  if (isError || !stats || !stats.summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-10 bg-white rounded-[2.5rem] border border-red-50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-800">Failed to load metrics</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          There was an issue communicating with the server. Please ensure you are logged in as an Admin.
        </p>
        <button 
          onClick={() => refetch()}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium tracking-tight">Detailed engagement and platform health metrics.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.summary?.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-900 leading-none">
                  {stat.value?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Posts List */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Top Performing Content
              </h3>
              <Link to="/admin/posts" className="text-sm font-bold text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            
            <div className="space-y-2">
              {stats.topPosts?.length > 0 ? (
                stats.topPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-5 hover:bg-slate-50 rounded-2xl transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {post.title}
                      </span>
                      <span className="text-xs text-slate-400 font-medium italic tracking-tight">Most engaged article</span>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Likes</span>
                        <span className="text-rose-500 font-black">❤️ {post._count?.likes || 0}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Comments</span>
                        <span className="text-amber-500 font-black">💬 {post._count?.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 italic">No posts found.</div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 leading-tight">Growth & <br />Content</h3>
              <p className="text-indigo-100 text-sm mb-8 font-medium">
                Keep the momentum going by publishing new articles or reviewing user comments.
              </p>
            </div>
            
            <div className="space-y-3 relative z-10">
              <Link 
                to="/admin/posts" 
                className="block w-full bg-white text-indigo-600 text-center py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
              >
                Post Manager
              </Link>
              <button className="block w-full bg-indigo-500 text-white border border-indigo-400 text-center py-4 rounded-2xl font-black hover:bg-indigo-400 transition-all active:scale-95">
                Generate Report
              </button>
            </div>
            
            {/* Animated Glow Effect */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;