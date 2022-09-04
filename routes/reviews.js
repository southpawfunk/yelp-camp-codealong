const express = require('express');
//by default we don't have access to params from app.use() in another file
//routers get separate params, so we have to set mergeParams : true
// to have access to :id in this instance, but already had access to
//:reviewId because it is defined in this router/path
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { joiReviewSchema } = require('../joiSchemas');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
	const { error } = joiReviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//CREATE NEW REVIEW
router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
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
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Your review has been deleted!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
