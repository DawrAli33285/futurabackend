
const reviewsModel = require('../models/reviews');
const itemsModel = require('../models/items');

const createReview = async (req, res) => {
    try {
        const { review, starts, item } = req.body;

        if (!review || !starts || !item) {
            return res.status(400).json({ message: 'review, starts and item are required' });
        }

        if (starts < 1 || starts > 5) {
            return res.status(400).json({ message: 'starts must be between 1 and 5' });
        }

        const existingItem = await itemsModel.findById(item);
        if (!existingItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const newReview = await reviewsModel.create({
            user: req.user.id,
            review,
            starts,
            item
        });

        const populatedReview = await newReview.populate('user', 'name email');

        return res.status(201).json({
            message: 'Review created successfully',
            review: populatedReview
        });
    } catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({ message: 'Something went wrong while creating the review' });
    }
};


const getReviewsForItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const reviews = await reviewsModel
            .find({ item: itemId })
            .populate('user', 'name email')
            .sort({ _id: -1 });

        const count = reviews.length;
        const avgRating = count
            ? reviews.reduce((sum, r) => sum + r.starts, 0) / count
            : 0;

        return res.status(200).json({
            message: 'Reviews fetched successfully',
            count,
            avgRating,
            reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching reviews' });
    }
};


const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewsModel
            .find()
            .populate('user', 'name email username')
            .populate('item', 'title')
            .sort({ _id: -1 });

        return res.status(200).json({
            message: 'Reviews fetched successfully',
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching reviews' });
    }
};


const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review, starts } = req.body;

        const existingReview = await reviewsModel.findById(id);

        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (existingReview.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You are not allowed to edit this review' });
        }

        if (starts !== undefined && (starts < 1 || starts > 5)) {
            return res.status(400).json({ message: 'starts must be between 1 and 5' });
        }

        if (review) existingReview.review = review;
        if (starts !== undefined) existingReview.starts = starts;

        const updatedReview = await existingReview.save();
        const populatedReview = await updatedReview.populate('user', 'name email');

        return res.status(200).json({
            message: 'Review updated successfully',
            review: populatedReview
        });
    } catch (error) {
        console.error('Update review error:', error);
        return res.status(500).json({ message: 'Something went wrong while updating the review' });
    }
};


const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const existingReview = await reviewsModel.findById(id);

        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const isOwner = existingReview.user.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin'; 

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'You are not allowed to delete this review' });
        }

        await reviewsModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Review deleted successfully',
            review: existingReview
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({ message: 'Something went wrong while deleting the review' });
    }
};


module.exports = {
    createReview,
    getReviewsForItem,
    getAllReviews,
    updateReview,
    deleteReview
};