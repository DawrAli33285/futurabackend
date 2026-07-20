
const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllPurchases,
  getAllCustomers
} = require('../controllers/purchase');
const isAuth = require('../middleware/user'); 
const isAdmin=require('../middleware/admin')

router.post('/place-order', isAuth, placeOrder);

router.get('/purchases', isAdmin, getAllPurchases);
router.get('/customers', isAdmin, getAllCustomers);

module.exports = router;