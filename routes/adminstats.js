const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminstats');
const isAdmin = require('../middleware/admin');

router.get('/stats', isAdmin, getDashboardStats);

module.exports = router;