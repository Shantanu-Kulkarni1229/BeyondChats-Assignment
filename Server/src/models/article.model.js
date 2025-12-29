import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    url: {
      type: String,
      required: [true, 'Article URL is required'],
      trim: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL'
      }
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters long']
    },
    date: {
      type: Date,
      default: Date.now
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


articleSchema.index({ date: -1 });
articleSchema.index({ createdAt: -1 });

articleSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});



const Article = mongoose.model('Article', articleSchema);

export default Article;
