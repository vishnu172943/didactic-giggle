const mongoose = require('mongoose');

// This schema defines the structure of the data we'll save in MongoDB.
const StoreInfoSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    unique: true, // This ensures we can only have one entry per store
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  }
}, {
  // Automatically adds `createdAt` and `updatedAt` timestamps
  timestamps: true
});

// Create the model
const StoreInfo = mongoose.model('StoreInfo', StoreInfoSchema);

module.exports = StoreInfo;
