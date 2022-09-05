const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
//package to let us "fake" a post request as a put instead
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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

//EXPRESS
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
//the name passed is the name needed in the query string to set as different request
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret            : 'secretsecretivegotasecret',
	resave            : false,
	saveUninitialized : true,
	cookie            : {
		httpOnly : true,
		expires  : Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge   : 1000 * 60 * 60 * 24 * 7
	}
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
//app.use(session()) must come before passport.session()
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//tells passport how to serialize a user which means
//how do we store a user in a session basically
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds/:id/reviews/', reviewRoutes);
app.use('/campgrounds', campgroundRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

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
