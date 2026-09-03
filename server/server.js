const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const slotsRouter = require('./routes/slots');
const alertsRouter = require('./routes/alerts');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// API Routes
app.use('/api/slots', slotsRouter);
app.use('/api/alerts', alertsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Solar Cold Storage API', status: 'running', database: 'connected' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
