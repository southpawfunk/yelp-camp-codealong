const express = require('express');
//by default we don't have access to params from app.use() in another file
//routers get separate params, so we have to set mergeParams : true
// to have access to :id in this instance, but already had access to
//:reviewId because it is defined in this router/path
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

//CREATE NEW REVIEW
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//DELETE MATCHING REVIEW
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
