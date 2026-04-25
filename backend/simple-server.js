const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 5001;

console.log('Starting simplified server...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected successfully!');
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });

app.get('/test', (req, res) => res.json({ message: 'Backend is working!' }));
