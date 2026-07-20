const express = require('express');
const router = express.Router();
const { createItem, getItems, getFeaturedItems,getItem, updateItem, deleteItem } = require('../controllers/items'); 
const isAdmin = require('../middleware/admin'); 
const upload = require('../middleware/upload'); 


router.get('/', getItems);
router.get('/featuredItems', getFeaturedItems);
router.get('/:id', getItem);


router.post('/', isAdmin, upload.single('image'), createItem);
router.put('/:id', isAdmin, upload.single('image'), updateItem);



router.delete('/:id', isAdmin, deleteItem);
module.exports = router;