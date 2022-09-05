const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const Campground = require('../models/campground');

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

/* Order matters in routes. if the /campgrounds/new route follows the 
/campgrounds/:id route, it will try accessing new as an id, rather than
render the new.ejs view.
*/

//SHOW NEW CAMPGROUND FORM PAGE
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

//CREATE NEW CAMPGROUND
router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Successfully made a new Campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//SHOW MATCHING CAMPGROUND PAGE
router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path     : 'reviews',
				populate : {
					path : 'author'
				}
			})
			.populate('author');
		if (!campground) {
			req.flash('error', 'Cannot find that Campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { campground });
	})
);

//SHOW MATCHING CAMPGROUND EDIT FORM PAGE
router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			req.flash('error', 'Cannot find that Campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground });
	})
);

//UPDATE CAMPGROUND
router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		req.flash('success', 'Successfully updated Campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//DELETE MATCHING CAMPGROUND
router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted Campground!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
