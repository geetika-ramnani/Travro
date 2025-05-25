import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const cities = require('./cities.json');


dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Improved CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));


// Update multer configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Add error handling middleware after your routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
      });
      console.log('Connected to MongoDB Atlas successfully');
      break;
    } catch (err) {
      currentRetry++;
      console.error(`MongoDB connection attempt ${currentRetry} failed:`, err.message);
      if (currentRetry === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    message: isConnected ? 'Connected to MongoDB Atlas' : 'Database connection failed'
  });
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    required: true // ensure at least one image is uploaded
  },
  destination: {
    type: String,
    required: true
  }
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Auth Routes
app.post('/api/register', upload.single('image'), async (req, res) => {
  try {
    const { username, password, dob, destination } = req.body;
    
    // Convert dob string to Date object
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).send({ error: 'Invalid date format' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    // Better file upload handling
    if (!req.file) {
      return res.status(400).send({ error: 'No image file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'travro_users',
    });

    const user = new User({
      username,
      password: hashedPassword,
      dob: dobDate, // Use the converted Date object
      destination,
      imageUrl: result.secure_url,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).send({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).send({ 
      error: 'Registration failed, Username might be taken',
      details: error.message // Include specific error details
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid login credentials');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


app.get('/api/city-suggestions', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json([]);
  }

  const suggestions = cities.filter(city => 
    city.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  res.json(suggestions);
});

// Add after your existing routes

// Get current user profile
app.get('/api/me', auth, async (req, res) => {
  try {
    res.send({ user: req.user });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch user data' });
  }
});

// Update profile
app.put('/api/profile', auth, upload.single('image'), async (req, res) => {
  try {
    const { destination } = req.body;
    const updates = { destination };

    // Handle image upload if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'travro_users',
      });
      updates.imageUrl = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.send({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).send({ 
      error: 'Profile update failed',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});