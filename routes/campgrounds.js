const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { joiCampgroundSchema } = require('../joiSchemas');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
	const { error } = joiCampgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

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
		// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', 'Successfully made a new Campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//SHOW MATCHING CAMPGROUND PAGE
router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate('reviews');
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
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted Campground!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
