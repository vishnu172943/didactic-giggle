require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const StoreInfo = require('./models/StoreInfo'); // Import our updated model

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. Middleware ---
app.use(cors()); 
app.use(express.json()); // Don't forget this!

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// --- 3. API Routes ---

/**
 * [GET] /store-info
 * Fetches the existing information for a store. This route doesn't
 * need any changes; it will automatically return the new fields.
 */
app.get('/store-info', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) {
    return res.status(400).json({ message: 'shopId query parameter is required.' });
  }

  try {
    const info = await StoreInfo.findOne({ shopId: shopId });
    if (info) {
      res.status(200).json(info);
    } else {
      res.status(404).json({ message: 'No information found for this store.' });
    }
  } catch (error) {
    console.error('GET /store-info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * [POST] /store-info (Updated)
 * Creates or updates the store's information.
 * This is now flexible and will save *any* data sent in the body.
 */
app.post('/store-info', async (req, res) => {
  // We get shopId separately for the filter
  const { shopId } = req.body;

  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required in the request body.' });
  }

  // Create a copy of the body and remove shopId from it,
  // as we don't want to save it *inside* the update object.
  const updateData = { ...req.body };
  delete updateData.shopId; 

  // We must ensure the required fields are present *only on creation*
  if (!updateData.name || !updateData.mobileNumber) {
    // Check if the document already exists
    const existingDoc = await StoreInfo.findOne({ shopId: shopId });
    if (!existingDoc) {
      // It's a new doc, and required fields are missing
      return res.status(400).json({ message: 'name and mobileNumber are required for new entries.' });
    }
  }

  try {
    console.log(`Attempting to upsert document for shopId: ${shopId}`);
    
    const updatedInfo = await StoreInfo.findOneAndUpdate(
      { shopId: shopId }, // The filter (our unique identifier)
      { $set: updateData }, // The data to set (all fields from the body)
      { 
        new: true,    // Return the updated document
        upsert: true, // Create a new document if one doesn't exist
        runValidators: true, // Ensures schema rules are checked
        setDefaultsOnInsert: true // Applies your 'default' values on creation
      }
    );
    
    console.log('Upsert successful. Document:', updatedInfo);
    res.status(200).json(updatedInfo);

  } catch (error) {
    console.error('POST /store-info error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// --- 4. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});