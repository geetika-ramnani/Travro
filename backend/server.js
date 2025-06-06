 import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
import haversine from 'haversine-distance';



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

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// multer is a Node.js middleware for handling multipart/form-data, which is primarily used for file uploads.
const upload = multer({ dest: 'uploads/' });

// Body parsing middleware
app.use(express.json()); // Parses JSON request bodies into req.body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form submissions

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
    required: true 
  },
  destination: {
    type: String,
    required: true
  }
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

// models/City.js
const citySchema = new mongoose.Schema({
  city: String,
  country: String,
  lat: Number,
  lng: Number,
});

const City = mongoose.model('City', citySchema);


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
    const hashedPassword = await bcrypt.hash(password, 8);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'travro_users',
    });

    const user = new User({
      username,
      password: hashedPassword,
      dob,
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
    console.error(error);
    res.status(400).send({ error: 'Registration failed.' });
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

  const suggestions = cities
    .filter(city =>
      city.city.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map(city => city.city);

  res.json(suggestions);
});

app.put('/api/profile', auth, upload.single('image'), async (req, res) => {
  try {
    const updates = {};

    if (req.body.destination) {
      updates.destination = req.body.destination;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'travro_users',
      });
      updates.imageUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    res.send(updatedUser);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update profile' });
  }
});

app.get('/api/profile', auth, async (req, res) => {
  res.send({
    username: req.user.username,
    dob: req.user.dob,
    imageUrl: req.user.imageUrl,
    destination: req.user.destination,
  });
});

app.get('/api/explore', auth, async (req, res) => {
  try {
    const currentUser = req.user;

    // Get coordinates of current user's destination
    const currentCity = cities.find(city => city.city.toLowerCase() === currentUser.destination.toLowerCase());
    if (!currentCity) return res.status(400).json({ error: 'Invalid destination in your profile.' });

    const currentLocation = { lat: currentCity.lat, lng: currentCity.lng };

    // Filter other users
    const users = await User.find({ _id: { $ne: currentUser._id } });

    const nearbyUsers = users.filter(user => {
      const otherCity = cities.find(city => city.city.toLowerCase() === user.destination.toLowerCase());
      if (!otherCity) return false;

      const otherLocation = { lat: otherCity.lat, lng: otherCity.lng };
      const distanceInMeters = haversine(currentLocation, otherLocation);
      const distanceInKm = distanceInMeters / 1000;

      return distanceInKm <= 400;
    });

    // Format the response
    const response = nearbyUsers.map(user => ({
      username: user.username,
      age: Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)),
      imageUrl: user.imageUrl,
      destination: user.destination,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error in /api/explore:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});