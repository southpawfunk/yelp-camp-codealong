const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
//package to let us "fake" a post request as a put instead
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose.connect(
	'mongodb://localhost:27017/yelp-camp',
	{
		/* THESE OPTIONS ARE TRUE BY DEFAULT IN MONGOOSE 6+
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true */
	}
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
//the name passed is the name needed in the query string to set as different request
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
	res.render('home');
});

app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

/* Order matters in routes. if the /campgrounds/new route follows the 
/campgrounds/:id route, it will try accessing new as an id, rather than
render the new.ejs view.
*/
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.post(
	'/campgrounds',
	catchAsync(async (req, res, next) => {
		// if (req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const joiCampgroundSchema = Joi.object({
			campground : Joi.object({
				title       : Joi.string().required().min(5).max(50).pattern(new RegExp('^[^\\W_]+[\\s\\w\\\\/]*$')),

				image       : Joi.string().required(),

				price       : Joi.number().required().min(0).max(10000),

				description : Joi.string()
					.required()
					.pattern(new RegExp('^[\\s\\w!@#$%^&*(),.?\'"{}\\[\\];:\\\\/<>|+-=`~]*$'))
					.min(30)
					.max(300),

				location    : Joi.string().required().min(5).max(50).pattern(new RegExp('^[^\\W_]+[\\s\\w\\\\/]*$'))
			}).required()
		});
		const result = joiCampgroundSchema.validate(req.body);
		console.log(result);
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/show', { campground });
	})
);

app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

app.put(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page no findey', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Zoinks! Like Something Bad Happened!';
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log('Serving on port 3000');
});
