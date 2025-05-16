import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Calendar, ThumbsUp, MessageSquare, Filter } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { forumAPI } from '../../services/api';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  category?: string;
  comments: Comment[];
  likes: number;
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const ForumPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { isAuthenticated, user } = useAuth();

  // Sample posts if API fails
  const samplePosts: Post[] = [
    {
      _id: "1",
      title: "Tips for growing tomatoes in containers",
      content: "I've been growing tomatoes in containers for years, and I've learned a few things that might help others. First, make sure your container is big enough - at least 5 gallons. Second, use a good quality potting mix specifically designed for vegetables. Third, water consistently and deeply, especially during fruit set. Anyone else have container gardening tips to share?",
      author: {
        _id: "101",
        name: "GardenGuru"
      },
      category: "Growing Tips",
      comments: [
        {
          _id: "c1",
          content: "I've had great success with adding crushed eggshells to the soil when planting. It helps prevent blossom end rot by providing calcium!",
          author: {
            _id: "102",
            name: "TomatoLover"
          },
          createdAt: "2023-03-15T14:32:00Z"
        },
        {
          _id: "c2",
          content: "Don't forget to prune your indeterminate tomato varieties! It makes a huge difference in yield.",
          author: {
            _id: "103",
            name: "UrbanFarmer"
          },
          createdAt: "2023-03-16T09:15:00Z"
        }
      ],
      likes: 24,
      createdAt: "2023-03-14T10:30:00Z"
    },
    {
      _id: "2",
      title: "Best rice varieties for home gardens?",
      content: "I'm thinking of growing rice in my backyard. I have a small area that gets waterlogged naturally. Has anyone tried growing rice at home? What varieties would you recommend for beginners?",
      author: {
        _id: "104",
        name: "HomesteadNewbie"
      },
      category: "Crop Selection",
      comments: [
        {
          _id: "c3",
          content: "I've had good luck with Jasmine rice varieties. They're relatively easy to grow and quite productive!",
          author: {
            _id: "105",
            name: "RiceGrower"
          },
          createdAt: "2023-04-02T16:45:00Z"
        }
      ],
      likes: 18,
      createdAt: "2023-04-01T08:20:00Z"
    },
    {
      _id: "3",
      title: "Dealing with pests naturally",
      content: "What are your favorite natural pest control methods? I'm trying to avoid chemicals in my garden and looking for effective alternatives. So far I've tried neem oil with some success, but would love more ideas!",
      author: {
        _id: "106",
        name: "OrganicOnly"
      },
      category: "Pest Control",
      comments: [
        {
          _id: "c4",
          content: "Companion planting has worked wonders for me. Marigolds repel many pests, and nasturtiums act as trap crops!",
          author: {
            _id: "107",
            name: "CompanionGardener"
          },
          createdAt: "2023-05-05T11:30:00Z"
        },
        {
          _id: "c5",
          content: "Try diatomaceous earth for soft-bodied pests. It's natural and very effective.",
          author: {
            _id: "108",
            name: "NaturalDefender"
          },
          createdAt: "2023-05-06T14:10:00Z"
        },
        {
          _id: "c6",
          content: "I make a spray with hot peppers and garlic that keeps most insects away!",
          author: {
            _id: "109",
            name: "SpicyGardener"
          },
          createdAt: "2023-05-07T09:25:00Z"
        }
      ],
      likes: 42,
      createdAt: "2023-05-04T15:45:00Z"
    }
  ];

  // Categories for filtering and creating posts
  const categories = [
    'General',
    'Growing Tips',
    'Crop Selection',
    'Pest Control',
    'Harvest & Storage',
    'Soil & Fertilizers',
    'Success Stories'
  ];

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await forumAPI.getAllPosts();
        setPosts(response.posts);
        setError(null);
      } catch (err) {
        console.error('Error fetching forum posts:', err);
        setError('Failed to load forum posts. Please try again later.');
        // Use sample posts if API fails
        setPosts(samplePosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      alert('Please log in to create a post');
      return;
    }
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await forumAPI.createPost(newPost);
      
      // Add the new post to the list
      setPosts([response.post, ...posts]);
      
      // Reset form and close modal
      setNewPost({ title: '', content: '', category: 'General' });
      setShowCreateModal(false);
      setError(null);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts by category
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AgriGrow Community Forum</h1>
            <p className="text-gray-600 mt-2">
              Connect with fellow gardeners, share your experiences, and get advice
            </p>
          </div>
          
          <button
            onClick={() => isAuthenticated ? setShowCreateModal(true) : alert('Please log in to create a post')}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Post
          </button>
        </div>
        
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-green-700 mr-2" />
            <h3 className="font-medium">Filter by Category</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Topics
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'all'
                ? "There are no posts yet. Be the first to start a discussion!"
                : `There are no posts in the ${selectedCategory} category yet.`}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
              >
                Create Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <Link to={`/forum/${post._id}`}>
                    <h2 className="text-xl font-bold text-gray-800 hover:text-green-700 transition-colors mb-2">
                      {post.title}
                    </h2>
                  </Link>
                  
                  {post.category && (
                    <span className="inline-block bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full mb-3">
                      {post.category}
                    </span>
                  )}
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{post.author.name}</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                {post.comments.length > 0 && (
                  <div className="bg-gray-50 p-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent comments:</h3>
                    <div className="space-y-3">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment._id} className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{comment.author.name}</span>
                            <span className="text-gray-500 text-xs">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{comment.content}</p>
                        </div>
                      ))}
                      
                      {post.comments.length > 2 && (
                        <Link
                          to={`/forum/${post._id}`}
                          className="text-green-700 text-sm hover:underline"
                        >
                          View all {post.comments.length} comments
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold">Create New Post</h2>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter a descriptive title"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    rows={6}
                    placeholder="Share your thoughts, questions, or experiences..."
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isLoading}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ForumPage; 