const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventRoutes = require('./routes/events');
const poapRoutes = require('./routes/poap');
const compileRoutes = require('./routes/compile');
const uploadRoutes = require('./routes/upload');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads')); // Serve static files from 'uploads'

// Connect to MongoDB with error handling
mongoose.connect('mongodb://127.0.0.1:27017/events', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Routes
app.use('/events', eventRoutes);
app.use('/poap', poapRoutes);
app.use('/compile', compileRoutes);
app.use('/upload', uploadRoutes);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
