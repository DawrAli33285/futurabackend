const mongoose = require('mongoose');

let connection = mongoose.connect(process.env.CONNECTION_URL);

module.exports = connection;