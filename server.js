const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Request Schema
const requestSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  selectedServices: [String],
  status: {
    type: String,
    default: 'Pending'
  },
  submittedDate: {
    type: String
  },
  submittedDateTime: {
    type: String
  },
  submittedTimestamp: {
    type: Number
  }
});

const Request = mongoose.model('Request', requestSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

// Routes
// Create a new request
app.post('/api/requests', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ submittedTimestamp: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific request by ID
app.get('/api/requests/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    
    res.status(201).json({ token, name: user.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    
    res.json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Update user name
app.put('/api/user/name', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ name: user.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user password
app.put('/api/user/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});