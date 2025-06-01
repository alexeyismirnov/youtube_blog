const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Log port configuration
console.log(`Starting server on port ${port}...`);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true }
});

const assignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  categoryId: { type: String, required: true }
});

// Create models
const Category = mongoose.model('Category', categorySchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:5001/auth/google/callback`,
  scope: ['profile', 'https://www.googleapis.com/auth/youtube.readonly'],
  accessType: 'offline',
  prompt: 'consent',
}, (accessToken, refreshToken, profile, done) => {
  // Store tokens in user session
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}));

// Routes
app.get('/', (req, res) => {
  res.send('YouTube Subscription Manager Backend');
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with user info
    res.redirect(`${process.env.FRONTEND_URL}?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// Check authentication status
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Get user subscriptions
app.get('/api/subscriptions', async (req, res) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const subscriptions = await fetchUserSubscriptions(req.user);
    console.log('Fetched', subscriptions.length, 'subscriptions');
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      error: 'Failed to fetch subscriptions',
      details: error.message
    });
  }
});

// Category endpoints
app.get('/api/categories', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const categories = await Category.find({ userId: req.user.id });
    // Convert MongoDB objects to plain JS objects and convert _id to string
    const plainCategories = categories.map(cat => ({
      ...cat.toObject(),
      _id: cat._id.toString(),
      id: cat._id.toString()
    }));
    res.json(plainCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  try {
    const newCategory = new Category({
      userId: req.user.id, // Use consistent user ID field
      name
    });
    
    await newCategory.save();
    // Convert to plain object with string IDs
    const plainCategory = {
      ...newCategory.toObject(),
      _id: newCategory._id.toString(),
      id: newCategory._id.toString()
    };
    res.status(201).json(plainCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const categoryId = req.params.id;
  
  try {
    const category = await Category.findOneAndDelete({ 
      _id: categoryId,
      userId: req.user.id 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Remove assignments for this category
    await Assignment.deleteMany({
      userId: req.user.id, // Use consistent user ID field
      categoryId: categoryId
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Assignment endpoints
app.post('/api/assign', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { subscriptionId, categoryId } = req.body;
  
  if (!subscriptionId) {
    return res.status(400).json({ error: 'subscriptionId is required' });
  }
  
  try {
    // Remove existing assignment for this subscription
    await Assignment.deleteMany({
      userId: req.user.id, // Use consistent user ID field
      subscriptionId: subscriptionId
    });
    
    // Only add new assignment if categoryId is provided
    if (categoryId) {
      const newAssignment = new Assignment({
        userId: req.user.id, // Use consistent user ID field
        subscriptionId,
        categoryId
      });
      
      await newAssignment.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error assigning subscription:', error);
    res.status(500).json({ error: 'Failed to assign subscription' });
  }
});

// Video endpoints
app.get('/api/videos', async (req, res) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const categoryId = req.query.categoryId;
  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId is required' });
  }
  
  try {
    // Get assignments for this category
    const assignments = await Assignment.find({
      userId: req.user.id,
      categoryId: categoryId
    });
    
    // Get all subscriptions for the user
    const subscriptions = await fetchUserSubscriptions(req.user);
    
    // Create subscription ID to channel ID map
    const subscriptionMap = {};
    subscriptions.forEach(sub => {
      subscriptionMap[sub.id] = sub.channelId;
    });
    
    // Get channel IDs for assignments
    const channelIds = assignments
      .map(a => subscriptionMap[a.subscriptionId])
      .filter(channelId => channelId);
    
    if (channelIds.length === 0) {
      return res.json([]);
    }
    
    // Create OAuth2 client with access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user.accessToken
    });
    
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
    
    // Fetch videos for each channel
    const videoRequests = channelIds.map(channelId =>
      youtube.search.list({
        part: 'snippet',
        channelId: channelId,
        order: 'date',
        maxResults: 10,
        type: 'video'
      }).then(response => {
        return response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails.default.url
        }));
      })
    );
    
    const videosByChannel = await Promise.all(videoRequests);
    const allVideos = videosByChannel.flat();
    
    // Sort by publishedAt descending (newest first)
    allVideos.sort((a, b) =>
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );
    
    res.json(allVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Helper function to fetch subscriptions
async function fetchUserSubscriptions(user) {
  try {
    // Create OAuth2 client with access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: user.accessToken
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const response = await youtube.subscriptions.list({
      part: 'snippet',
      mine: true,
      maxResults: 50
    });
    
    return response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      channelId: item.snippet.resourceId.channelId
    }));
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

app.get('/api/assignments', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const assignments = await Assignment.find({ userId: req.user.id });
    
    // Get category IDs from assignments
    const categoryIds = assignments.map(a => a.categoryId);
    
    // Fetch categories in one query
    const categories = await Category.find({
      _id: { $in: categoryIds }
    });
    
    // Create category name map
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c._id.toString()] = c.name;
    });
    
    // Enrich assignments with category names
    const enrichedAssignments = assignments.map(a => ({
      ...a.toObject(),
      categoryName: categoryMap[a.categoryId] || 'Unknown'
    }));
    
    res.json(enrichedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});