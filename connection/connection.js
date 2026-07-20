const mongoose = require('mongoose');
const dns = require('dns');

// Force reliable public DNS resolvers to avoid flaky local router DNS
// causing SRV lookup timeouts (ECONNREFUSED on querySrv)
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect(process.env.CONNECTION_URL)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Don't crash the whole process on a transient connection failure;
    // mongoose will keep retrying in the background.
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected, attempting to reconnect...');
});

module.exports = mongoose.connection;