// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const StoreInfo = require('./models/StoreInfo'); // Import our model

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. Middleware ---
app.use(cors()); 
app.use(express.json()); // This line is crucial, make sure it's here

// --- 2. Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// --- 3. API Routes ---

// GET route...
app.get('/store-info', async (req, res) => {
  // (This route is likely fine, no changes needed)
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


// POST route (with added logging)
app.post('/store-info', async (req, res) => {
  // --- START DEBUGGING LOGS ---
  console.log('POST /store-info: Received a request.');
  console.log('Request Body:', req.body);
  // --- END DEBUGGING LOGS ---
  
  const { shopId, name, mobileNumber } = req.body;

  // --- START VALIDATION LOG ---
  if (!shopId || !name || !mobileNumber) {
    console.error('Validation Error: Missing required fields.');
    console.log(`Received: shopId=${shopId}, name=${name}, mobileNumber=${mobileNumber}`);
    return res.status(400).json({ message: 'Missing required fields: shopId, name, mobileNumber' });
  }
  // --- END VALIDATION LOG ---

  try {
    console.log(`Attempting to upsert document for shopId: ${shopId}`);
    
    const updatedInfo = await StoreInfo.findOneAndUpdate(
      { shopId: shopId }, // The filter
      { name: name, mobileNumber: mobileNumber }, // The data
      { 
        new: true,    // Return the updated document
        upsert: true  // Create a new document if one doesn't exist
      }
    );
    
    console.log('Upsert successful. Document:', updatedInfo);
    res.status(200).json(updatedInfo);

  } catch (error) {
    // This will catch Mongoose validation errors
    console.error('POST /store-info error during database operation:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// --- 4. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});