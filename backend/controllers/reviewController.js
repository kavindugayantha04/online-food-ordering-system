const Review = require('../models/Review');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { menuItemId, orderId, rating, comment } = req.body;

    // Check if the user actually ordered this item
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
      status: 'Delivered',
    });

    if (!order) {
      return res.status(400).json({
        message: 'You can only review items from your delivered orders',
      });
    }

    // Check if user already reviewed this item from this order
    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      menuItemId,
      orderId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: 'You have already reviewed this item',
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      menuItemId,
      orderId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a menu item + average rating
// @route   GET /api/reviews/menu/:menuItemId
// @access  Public
const getReviewsByMenuItem = async (req, res) => {
  try {
    const reviews = await Review.find({ menuItemId: req.params.menuItemId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating using MongoDB aggregation
    const avgResult = await Review.aggregate([
      {
        $match: {
          menuItemId: new mongoose.Types.ObjectId(req.params.menuItemId),
        },
      },
      {
        $group: {
          _id: '$menuItemId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      avgResult.length > 0
        ? Math.round(avgResult[0].averageRating * 10) / 10
        : 0;
    const totalReviews =
      avgResult.length > 0 ? avgResult[0].totalReviews : 0;

    res.status(200).json({
      averageRating,
      totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'name')
      .populate('menuItemId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews by logged in user
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('menuItemId', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (owner only)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to update this review',
      });
    }

    const { rating, comment } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (owner only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviewsByMenuItem,
  getReviewById,
  getMyReviews,
  updateReview,
  deleteReview,
};