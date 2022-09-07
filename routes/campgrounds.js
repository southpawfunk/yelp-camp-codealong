const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const Campground = require('../models/campground');

router.get('/', catchAsync(campgrounds.index));

/* Order matters in routes. if the /campgrounds/new route follows the 
/campgrounds/:id route, it will try accessing new as an id, rather than
render the new.ejs view.
*/

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
