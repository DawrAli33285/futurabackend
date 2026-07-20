const mongoose = require('mongoose');
const dns = require('dns');

// Avoid flaky local DNS resolver issues with SRV lookups
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = "mongodb+srv://gulfambibi33285_db_user:DDOl8nlXnuE3acSA@cluster0.uxaqvjh.mongodb.net/";

console.log('Attempting to connect to MongoDB...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Connected to database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection FAILED');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

module.exports = mongoose.connection;