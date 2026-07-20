
const express = require('express');
const router = express.Router();
const {
    createReview,
    getReviewsForItem,
    getAllReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviews');
const isAuth = require('../middleware/user'); 

router.get('/', getAllReviews);
router.get('/item/:itemId', getReviewsForItem);

router.post('/', isAuth, createReview);
router.put('/:id', isAuth, updateReview);
router.delete('/:id', isAuth, deleteReview);

module.exports = router;