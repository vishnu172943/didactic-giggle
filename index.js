// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const StoreInfo = require('./models/storeInfo'); // Import our model

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
// This is VITAL for your Shopify store to be able to talk to this server.
app.use(cors()); 

// Parse incoming JSON payloads
app.use(express.json());

// --- 2. Database Connection ---

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if we can't connect
  });

// --- 3. API Routes ---

/**
 * [GET] /store-info
 * Fetches the existing information for a store based on its shopId.
 */
app.get('/store-info', async (req, res) => {
  const { shopId } = req.query;

  if (!shopId) {
    return res.status(400).json({ message: 'shopId query parameter is required.' });
  }

  try {
    const info = await StoreInfo.findOne({ shopId: shopId });
    
    if (info) {
      // Data found, send it back
      res.status(200).json(info);
    } else {
      // No data found for this shopId
      res.status(404).json({ message: 'No information found for this store.' });
    }
  } catch (error) {
    console.error('GET /store-info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * [POST] /store-info
 * Creates a new entry or updates an existing one (this is called "upsert").
 * This single endpoint handles both "Save" and "Update" from the frontend.
 */
app.post('/store-info', async (req, res) => {
  const { shopId, name, mobileNumber } = req.body;

  if (!shopId || !name || !mobileNumber) {
    return res.status(400).json({ message: 'Missing required fields: shopId, name, mobileNumber' });
  }

  try {
    // Find a document with this shopId and update it.
    // If it doesn't exist (upsert: true), create it.
    // 'new: true' returns the new/updated document.
    const updatedInfo = await StoreInfo.findOneAndUpdate(
      { shopId: shopId }, // The filter to find the document
      { name: name, mobileNumber: mobileNumber }, // The data to set
      { 
        new: true,    // Return the updated document
        upsert: true  // Create a new document if one doesn't exist
      }
    );
    
    // Send the saved/updated data back to the frontend
    res.status(200).json(updatedInfo);

  } catch (error) {
    console.error('POST /store-info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- 4. Start the Server ---

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
