const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  zip: {
    type: Number
  },
  location: {
    type: String
  }
}, {
  timestamps: false
});

module.exports = userSchema;
