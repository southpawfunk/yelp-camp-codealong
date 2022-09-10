const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds, view: 'index' });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder.forwardGeocode({ query: req.body.campground.location, limit: 1 }).send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'Successfully made a new Campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
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
	res.render('campgrounds/show', { campground, view: 'show' });
};

module.exports.renderEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Cannot find that Campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground, view: 'edit' });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	console.log(req.body);
	const campground = await Campground.findById(id);
	campground.images = campground.images.concat(req.files.map((f) => ({ url: f.path, filename: f.filename })));
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			//don't try to remove seeded images from cloudinary if they were seeded
			//from unsplash API
			if (!filename.startsWith('SEEDED-IMG')) {
				console.log(filename);
				await cloudinary.uploader.destroy(filename);
			}
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
		console.log(campground);
	}
	req.flash('success', 'Successfully updated Campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted Campground!');
	res.redirect('/campgrounds');
};
