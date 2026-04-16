const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsByMenuItem,
  getReviewById,
  getMyReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/menu/:menuItemId', getReviewsByMenuItem);
router.get('/:id', getReviewById);

// Private routes (requires JWT)
router.post('/', protect, addReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;