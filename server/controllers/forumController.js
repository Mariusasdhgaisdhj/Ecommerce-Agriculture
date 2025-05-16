import forumModel from '../models/forumModel.js';

// Create forum post
export const createForumPostController = async (req, res) => {
  try {
    const { title, content, category, tags, images } = req.body;
    
    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required',
      });
    }
    
    // Create forum post
    const post = new forumModel({
      title,
      content,
      user: req.user._id,
      category,
      tags: tags || [],
      images: images || [],
    });
    
    await post.save();
    
    return res.status(201).json({
      success: true,
      message: 'Forum post created successfully',
      post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating forum post',
      error: error.message,
    });
  }
};

// Get all forum posts with pagination
export const getForumPostsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    // Count total
    const total = await forumModel.countDocuments(query);
    
    // Get posts
    const posts = await forumModel
      .find(query)
      .populate('user', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);
    
    return res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting forum posts',
      error: error.message,
    });
  }
};

// Get single forum post
export const getSingleForumPostController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get post
    const post = await forumModel
      .findById(id)
      .populate('user', 'name')
      .populate('comments.user', 'name');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
      });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting forum post',
      error: error.message,
    });
  }
};

// Add comment to forum post
export const addCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    // Validation
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }
    
    // Get post
    const post = await forumModel.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
      });
    }
    
    // Add comment
    post.comments.push({
      user: req.user._id,
      text,
    });
    
    await post.save();
    
    // Populate user info for the new comment
    const updatedPost = await forumModel
      .findById(id)
      .populate('user', 'name')
      .populate('comments.user', 'name');
    
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in adding comment',
      error: error.message,
    });
  }
};

// Vote on a forum post (upvote or downvote)
export const voteForumPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'up' or 'down'
    
    // Validation
    if (!vote || (vote !== 'up' && vote !== 'down')) {
      return res.status(400).json({
        success: false,
        message: 'Valid vote type (up/down) is required',
      });
    }
    
    // Get post
    const post = await forumModel.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
      });
    }
    
    const userId = req.user._id.toString();
    
    // Remove user from both upvotes and downvotes
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
    
    // Add vote
    if (vote === 'up') {
      post.upvotes.push(req.user._id);
    } else {
      post.downvotes.push(req.user._id);
    }
    
    await post.save();
    
    return res.status(200).json({
      success: true,
      message: `${vote === 'up' ? 'Upvote' : 'Downvote'} successful`,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in voting',
      error: error.message,
    });
  }
};

// Get forum categories
export const getForumCategoriesController = async (req, res) => {
  try {
    const categories = [
      'Growing Tips',
      'Pest Control',
      'Seed Selection',
      'Harvesting',
      'General Discussion'
    ];
    
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in getting forum categories',
      error: error.message,
    });
  }
}; 