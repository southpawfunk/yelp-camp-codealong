const express = require('express');
//by default we don't have access to params from app.use() in another file
//routers get separate params, so we have to set mergeParams : true
// to have access to :id in this instance, but already had access to
//:reviewId because it is defined in this router/path
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

//CREATE NEW REVIEW
router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Successfully created your new review!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//DELETE MATCHING REVIEW
router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Your review has been deleted!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
