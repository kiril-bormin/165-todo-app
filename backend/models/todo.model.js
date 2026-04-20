const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: false
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: false
  }
);

// Create text index for search
todoSchema.index({ text: 'text' });

module.exports = todoSchema;
