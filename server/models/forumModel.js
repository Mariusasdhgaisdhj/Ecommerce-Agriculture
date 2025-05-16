import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Growing Tips', 'Pest Control', 'Seed Selection', 'Harvesting', 'General Discussion'],
    },
    tags: [String],
    comments: [commentSchema],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model('forum_posts', forumPostSchema); 