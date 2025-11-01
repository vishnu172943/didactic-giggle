const mongoose = require('mongoose');

const StoreInfoSchema = new mongoose.Schema({
  // --- Original Fields ---
  shopId: {
    type: String,
    required: true,
    unique: true, // This is our unique identifier
    index: true,
  },
  name: {
    type: String,
    required: true, // Kept from original form
  },
  mobileNumber: {
    type: String,
    required: true, // Kept from original form
  },
  
  // --- NEW: Shipping Bar Content Fields ---
  title: {
    type: String,
    default: "Free Shipping Bar"
  },
  goal_amount: {
    type: Number,
    default: 100
  },
  initial_message: {
    type: String,
    default: "Free shipping for orders over {goal_amount}!"
  },
  progress_message: {
    type: String,
    default: "You're {goal_amount} away from free shipping!"
  },
  goal_achieved_message: {
    type: String,
    default: "Enjoy!! You've got free shipping!"
  },
  currency_symbol: {
    type: String,
    default: "$"
  },
  symbol_position: {
    type: String,
    default: "before"
  },

  // --- NEW: Shipping Bar Style Fields ---
  bg_color: {
    type: String,
    default: "#f5f5f5"
  },
  text_color: {
    type: String,
    default: "#333333"
  },
  special_text_color: {
    type: String,
    default: "#008060"
  },
  font_family: {
    type: String,
    default: "sans-serif"
  },
  font_size: {
    type: Number,
    default: 14
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const StoreInfo = mongoose.model('StoreInfo', StoreInfoSchema);

module.exports = StoreInfo;
